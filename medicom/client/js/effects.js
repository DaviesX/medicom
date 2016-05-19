
export function BatchedEffect(type) {
        this.__type = type;
        this.__elms = [];
        this.__eff_intv = 800;

        this.finalize = function() {
                switch(this.__type) {
                case "fade":
                        for (var i = 0; i < this.__elms.length; i ++) {
                                this.__elms[i].fadeOut(0);
                        }
                        break;
                default:
                        throw "Unkown effect: " + this.__type;
                }
        }

        this.add_elm = function(elm) {
                this.__elms[this.__elms.length] = elm;
        }

        this.animate = function() {
                switch(this.__type) {
                case "fade":
                        for (var i = 0; i < this.__elms.length; i ++) {
                                this.__elms[i].fadeIn(this.__eff_intv);
                        }
                        break;
                default:
                        throw "Unkown effect: " + this.__type;
                }
        }
}


export function SequentialEffect(type) {
        this.__type = type;
        this.__elms = [];
        this.__eff_intv = 800;
        this.__eff_inc = null;

        this.finalize = function() {
                this.__eff_inc = this.__eff_intv/this.__elms.length;
                switch(this.__type) {
                case "fade":
                        for (var i = 0; i < this.__elms.length; i ++) {
                                this.__elms[i].fadeOut(0);
                        }
                        break;
                default:
                        throw "Unkown effect: " + this.__type;
                }
        }

        this.add_elm = function(elm) {
                this.__elms[this.__elms.length] = elm;
        }

        this.animate = function() {
                switch(this.__type) {
                case "fade":
                        for (var i = 0; i < this.__elms.length; i ++) {
                                this.__elms[i].fadeIn(this.__eff_inc*(i + 1));
                        }
                        break;
                default:
                        throw "Unkown effect: " + this.__type;
                }
        }
}
