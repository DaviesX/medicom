/*
 * This file is part of MediCom
 *
 * Copyright © 2016, Chifeng Wen.
 * MediCom is free software; you can redistribute it and/or modify it under the terms of
 * the GNU General Public License, version 2, as published by the Free Software Foundation.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not,
 * write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

/// <reference path="../../tslib/c3.d.ts" />
/// <reference path="../../tslib/d3.d.ts" />

export enum ChartShape
{
        Line,
        Bar,
        Overlay
};


interface IColorEval 
{
        eval(y_val: number): d3.Color;
}

class XDesc 
{
        public data_type:       string;
        public values:          Array<any>;
        
        constructor(data_type: string, values: Array<any>)
        {
                this.data_type = data_type;
                this.values = values;
        }
};

class YDesc 
{
        public label:           string;
        public data_type:       ChartShape;
        public color_eval:      IColorEval;

        public color:           d3.Color;
        public values:          Array<number>;

        constructor(label: string, 
                    data_type: ChartShape, 
                    color_eval: IColorEval, 
                    color: d3.Color,
                    values: Array<number>)
        {
                this.label = label;
                this.data_type = data_type;
                this.color_eval = color_eval;
                this.color = color;
                this.values = values;
        }
};

export interface IChart
{
        x():            XDesc;
        ys():           Array<YDesc>;
};


class ColorEvalBell implements IColorEval
{
        private m_miu:          number;
        private m_sigma:       number;
        private m_central_deg:  number;

        constructor(miu: number, sigma: number, central: number)
        {
                this.m_miu = miu;
                this.m_sigma = sigma;
                this.m_central_deg = central;
        }

        public eval(y_val: number): d3.Color
        {
                var level = Math.min(Math.max(
                        this.m_central_deg + (y_val - this.m_miu)*this.m_sigma, 0), 360);
                return d3.hsl(level, 0.4, 0.7);
        }
};

export class TemperalChart implements IChart
{
        private m_x_desc:       XDesc;            
        private m_y_descs:      Array<YDesc>;

        constructor() 
        {
                this.m_y_descs = new Array<YDesc>();
        }

        public set_x(x: Array<Date>): void
        {
                this.m_x_desc = new XDesc("time", x);
        }

        public add_y(label: string, y: Array<number>, color: d3.Color): void
        {
                this.m_y_descs.push(new YDesc(label, ChartShape.Line, null, color, y));
        }

        // @fixme: not enough to implement overlay.
        public set_overlay(y: Array<number>, miu: number, sigma: number, central_deg: number): void
        {
                this.m_y_descs.push(new YDesc("", ChartShape.Bar, 
                                              new ColorEvalBell(miu, sigma, central_deg), null, y));
        }

        public x(): XDesc
        {
                return this.m_x_desc;
        }

        public ys(): Array<YDesc>
        {
                return this.m_y_descs;
        }
};

export class BooleanChart implements IChart
{
        private m_x:            Array<string>;
        private m_y:            Array<[number, number]>;
        private m_binary:       [string, string];

        private m_colors:       [d3.Color, d3.Color];

        constructor(yes: string, no: string, 
                    color_yes: d3.Color, color_no: d3.Color) 
        {
                this.m_binary[0] = yes;
                this.m_binary[1] = no;

                this.m_colors[0] = color_yes;
                this.m_colors[1] = color_no;
        }

        public add_pair(category: string, y0: number, y1: number)
        {
                this.m_x.push(category);
                this.m_y.push([y0, y1]);
        }

        public x(): XDesc
        {
                return new XDesc("text", this.m_x);
        }

        public ys(): Array<YDesc>
        {
                var a = new Array<YDesc>();
                for (var i = 0; i < 2; i ++) {
                        var content = new Array<number>();
                        for (var j = 0; j < this.m_y.length; j ++) {
                                content.push(this.m_y[j][i]);
                        }
                        a.push(new YDesc(this.m_binary[i], ChartShape.Bar, null, this.m_colors[i], content));
                }
                return a;
        }
};

var cys: Array<YDesc>;

/*
 * <C3ChartRenderer> A C3 based chart renderer.
 */
export class C3ChartRenderer
{
        private m_target:       HTMLElement;

        constructor(target: HTMLElement)
        {
                this.m_target = target;
        }
        
        public render(chart: IChart): void
        {
                // Handle x axis.
                var chart_x = chart.x();
                var x = ["x"].concat(chart_x.values);
                var x_desc = {};
                switch (chart_x.data_type) {
                        case "time": {
                                x_desc = {
                                        type: "timeseries",
                                        tick: {
                                                format: "%Y-%m-%d",
                                        },
                                };
                                break;
                        }

                        case "text": {
                                x_desc = {
                                        type: "category",
                                };
                                break;
                        }

                        default: {
                                throw Error("Unknown X axis data type " + chart_x.data_type);
                        }
                }

                // Handle y axis.
                var max_height = 0;
                var columns = [x];
                cys = chart.ys(); 

                for (var i = 0; i < cys.length; i ++) {
                        for (var j = 0; j < cys[i].values.length; j ++) {
                                if (max_height > cys[i].values[j])
                                        max_height = cys[i].values[j];
                        }
                        columns.push((<Array<any>>[cys[i].label]).concat(cys[i].values));
                }

                var ys_type = {};
                var ys_color = {};
                for (var i = 0; i < cys.length; i ++) {
                        switch (cys[i].data_type) {
                                case ChartShape.Line: {
                                        ys_type[cys[i].label] = "line";
                                        break;
                                }
                                case ChartShape.Overlay:
                                case ChartShape.Bar: {
                                        ys_type[cys[i].label] = "bar";
                                        break;
                                }
                                default: {
                                        throw new Error("Unknown chart shape of " + cys[i].label);
                                }
                        }
                        ys_color[cys[i].label] = cys[i].color.toString();
                }

                c3.generate({
                        bindto: this.m_target,
                        data: {
                                x:              "x",
                                columns:        columns,
                                types:          ys_type,
                                colors:         ys_color,
                                color: function(color, d) {
                                        for (var i = 0; i < cys.length; i ++) {
                                                if (cys[i].label == d.id && cys[i].color_eval != null)
                                                        return cys[i].color_eval.eval(cys[i].values[d.index]).toString();
                                        }
                                        return color;
                                },
                        },
                        bar: {
                                width: {
                                        ratio: 1.0
                                }
                        },
                        axis: {
                                x: x_desc,
                                y: {
                                        max: max_height,
                                        min: 0,
                                        padding: {top: 0, bottom: 0}
                                }
                        }
                });
        }
};
