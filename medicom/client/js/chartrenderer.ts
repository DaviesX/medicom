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

type ColorEval = (i: number) => any;

export enum ChartShape
{
        Line,
        Bar,
        Overlay
};

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
        public color_eval:      ColorEval;
        public color:           d3.Color;
        public values:          Array<number>;

        constructor(label: string, 
                    data_type: ChartShape, 
                    color_eval: ColorEval, 
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

export class TemperalChart implements IChart
{
        private m_x_desc:       XDesc;            
        private m_y_descs:      Array<YDesc>;
        private m_color:        d3.Color;

        constructor(color: d3.Color) 
        {
                this.m_color = color;
        }

        public set_x(x: Array<Date>): void
        {
                this.m_x_desc = new XDesc("time", x);
        }

        public add_y(label: string, y: Array<number>, shape: ChartShape): void
        {
                this.m_y_descs.push(new YDesc(label, shape, null, this.m_color, y));
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
        private m_x:            [string, string];
        private m_y:            [number, number];
        private m_title:        string;
        private m_x_desc:       XDesc;
        private m_y_desc:       YDesc;
        private m_color:        d3.Color;

        constructor(title: string, color: d3.Color) 
        {
                this.m_title = title;
                this.m_color = color;
        }

        public set_yes(label: string, value: number)
        {
                this.m_x[1] = label;
                this.m_y[1] = value;
        }

        public set_no(label: string, value: number)
        {
                this.m_x[0] = label;
                this.m_y[0] = value;
        }

        public x(): XDesc
        {
                return new XDesc("text", this.m_x);
        }

        public ys(): Array<YDesc>
        {
                return [new YDesc(this.m_title, ChartShape.Bar, null, this.m_color, this.m_y)];
        }
};

var cys;

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
                        columns.push([cys[i].label].concat(cys[i].values));
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
                                                        return cys[i].color_eval(d.index);
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
