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

import {Mongo} from "meteor/mongo";
import {PrivilegeAction, privilege_action_copy} from "../api/privilege.ts";

/*
 * <PrivilegeEdge>
 */
class PrivilegeEdge
{
        public src:     number
        public dst:     number
        public action:  PrivilegeAction;

        constructor(src: number, dst: number, action: PrivilegeAction)
        {
                this.src = src;
                this.dst = dst;
                this.action = action;
        }
};

function privilege_edge_copy(pod): PrivilegeEdge
{
        var obj = new PrivilegeEdge(null, null, null);
        obj.src = pod.src;
        obj.dst = pod.dst;
        obj.action = privilege_action_copy(pod.action);
        return obj;
}

/*
 * <PrivilegeNode>
 */
class PrivilegeNode
{
        public node_ref:        number;
        public in_edges:        Array<PrivilegeEdge>;
        public out_edges:       Array<PrivilegeEdge>;

        constructor(node_ref: number)
        {
                this.node_ref = node_ref;
                this.in_edges = new Array<PrivilegeEdge>();
                this.out_edges = new Array<PrivilegeEdge>();
        }

        private remove_action(edge_set: Array<PrivilegeEdge>, 
                              src: number, dst: number, action: string): Array<PrivilegeEdge>
        {
                var num_removed = 0;
                for (var i = 0, j = 0; j < edge_set.length; j ++) {
                        if (edge_set[j].action.is_action_compatible(action) &&
                            edge_set[j].src == src &&
                            edge_set[j].dst == dst) {
                                num_removed ++;
                                continue;
                        } else
                                edge_set[i ++] = edge_set[j];
                }
                return edge_set.slice(edge_set.length - num_removed);
        }
        
        private remove_all_action(edge_set: Array<PrivilegeEdge>, action: string): Array<PrivilegeEdge>
        {
                var num_removed = 0;
                for (var i = 0, j = 0; j < edge_set.length; j ++) {
                        if (edge_set[j].action.is_action_compatible(action)) {
                                num_removed ++;
                                continue;
                        } else
                                edge_set[i ++] = edge_set[j];
                }
                return edge_set.slice(edge_set.length - num_removed);
        }
        
        private get_actions(edge_set: Array<PrivilegeEdge>, action: string): Array<PrivilegeAction>
        {
                var actions = new Array<PrivilegeAction>();
                for (var i = 0; i < edge_set.length; i ++) {
                        if (edge_set[i].action.is_action_compatible(action))
                                actions.push(edge_set[i].action);
                }
                return actions;
        }
        
        private get_action_with(edge_set: Array<PrivilegeEdge>, 
                                src: number, dst: number, action: string): PrivilegeAction
        {
                for (var i = 0; i < edge_set.length; i ++) {
                        if (edge_set[i].action.is_action_compatible(action) &&
                            edge_set[i].src == src &&
                            edge_set[i].dst == dst)
                                return edge_set[i].action;
                }
                return null;
        }
        
        private add_action(edge_set: Array<PrivilegeEdge>, 
                           src: number, dst: number, action: string, 
                           scope_set: Array<number>, with_grant_option: boolean): void
        {
                var priv_action = this.get_action_with(edge_set, src, dst, action);
                if (priv_action == null)
                        edge_set.push(new PrivilegeEdge(src, dst,
                                                        new PrivilegeAction(this.node_ref,
                                                                            action, scope_set, with_grant_option)));
                else {
                        for (var i = 0; i < scope_set.length; i ++)
                                priv_action.add_scope(scope_set[i], this.node_ref);
                        priv_action.set_grant_option(with_grant_option);
                }
        }
        
        public get_granted(action: string): Array<PrivilegeAction>
        {
                return this.get_actions(this.in_edges, action);
        }
        
        public get_granted_from(src_ref: number, action: string): PrivilegeAction
        {
                return this.get_action_with(this.in_edges, src_ref, this.node_ref, action);
        }
        
        public get_granting(action: string): Array<PrivilegeAction>
        {
                return this.get_actions(this.out_edges, action);
        }
        
        public get_all_actions(): Array<PrivilegeAction> 
        {
                var actions = new Array<PrivilegeAction>();
                for (var i = 0; i < this.in_edges.length; i ++)
                        actions.push(this.in_edges[i].action);
                return actions;
        }
        
        public remove_grant_from(src: number, action: string): void
        {
                this.in_edges = this.remove_action(this.in_edges, src, this.node_ref, action);
        }
        
        public remove_grant_to(dst: number, action: string): void
        {
                this.out_edges = this.remove_action(this.out_edges, this.node_ref, dst, action);
        }
        
        public remove_granted_all(action: string): void 
        {
                this.in_edges = this.remove_all_action(this.in_edges, action);
        }
        
        public remove_granting_all(action: string): void
        {
                this.out_edges = this.remove_all_action(this.out_edges, action);
        }
        
        public grant_from(src: number, action: string, scope_set: Array<number>, with_grant_option: boolean): void
        {
                this.add_action(this.in_edges, src, this.node_ref, action, scope_set, with_grant_option);
        }
        
        public grant_to(dst: number, action: string, scope_set: Array<number>, with_grant_option: boolean): void
        {
                this.add_action(this.out_edges, this.node_ref, dst, action, scope_set, with_grant_option);
        }
}

function privilege_node_copy(pod): PrivilegeNode
{
        var obj = new PrivilegeNode(null);
        obj.node_ref = pod.node_ref;
        obj.in_edges = pod.in_edges;
        obj.out_edges = pod.out_edges;

        for (var i = 0; i < obj.in_edges.length; i ++)
                obj.in_edges[i] = privilege_edge_copy(obj.in_edges[i]);

        for (var i = 0; i < obj.out_edges.length; i ++)
                obj.out_edges[i] = privilege_edge_copy(obj.out_edges[i]);

        return obj;
}

class Storage
{
        public nodes:           Array<PrivilegeNode>;
        public recycled:        Array<number>;

        constructor(nodes: Array<PrivilegeNode>, recycled: Array<number>)
        {
                this.nodes = nodes;
                this.recycled = recycled;
        }
};

/*
 * <PrivilegeNetwork>
 */
export class PrivilegeNetwork
{
        private storage:        Mongo.Collection<Storage>;
        private nodes:          Array<PrivilegeNode>;   // ref 0 is reserved.for the root.
        private recycled:       Array<number>; 

        constructor()
        {
                this.storage = new Mongo.Collection<Storage>("PrivilegeNetwork");
                this.nodes = new Array<PrivilegeNode>();
                this.recycled = new Array<number>();
                this.restore();
        }

        public store(): void
        {
                this.storage.remove({});
                this.storage.insert(new Storage(this.nodes, this.recycled));
        }

        public restore(): void
        {
                var mem = this.storage.findOne({});
                if (mem != null) {
                        this.recycled = mem.recycled;
                        for (var i = 0; i < mem.nodes.length; i ++)
                                if (mem.nodes[i] != null)
                                        this.nodes[i] = privilege_node_copy(mem.nodes[i]);
                } else {
                        this.recycled = new Array<number>(); 
                        this.nodes = new Array<PrivilegeNode>();
                        this.allocate_root();
                }
                this.store();
        }

        public reset(): void
        {
                this.storage.remove({});
                this.nodes = new Array<PrivilegeNode>();
                this.recycled = new Array<number>();

                this.nodes.push(null);
        }

        public allocate_root(): number
        {
                if (this.nodes[0] == null) {
                        this.nodes[0] = new PrivilegeNode(0);
                        this.store();
                }
                return 0;
        }

        public allocate(): number
        {
                var allocated;
                if (this.recycled.length == 0)
                        allocated = this.nodes.length;
                else
                        allocated = this.recycled.pop();
                this.nodes[allocated] = new PrivilegeNode(allocated);
                this.store();
                return allocated;
        }

        public dfs_remove_depended_nodes(node_ref: number, indi_set: Set<number>): void
        {
                if (!indi_set.has(node_ref) && this.nodes[node_ref] != null) {
                        indi_set.add(node_ref);
                        var node = this.nodes[node_ref];
                        for (var i = 0; i < node.out_edges.length; i ++)
                                this.dfs_remove_depended_nodes(node.out_edges[i].dst, indi_set);
                        this.nodes[node_ref] = null;
                        this.recycled.push(node_ref);
                }
        }


        public free(node_ref: number): boolean
        {
                if (this.nodes[node_ref] == null)
                        return false;
        
                var indi_set = new Set();
                this.dfs_remove_depended_nodes(node_ref, indi_set);
        
                if (node_ref == 0)
                        // Root is always none empty.
                        this.allocate_root();
        
                this.store();
                return true;
        }

        public dfs_remove_action(node_ref: number, indi_set: Set<number>, action: string): void
        {
                if (!indi_set.has(node_ref) && this.nodes[node_ref] != null) {
                        indi_set.add(node_ref);
                        var node = this.nodes[node_ref];
                        for (var i = 0; i < node.out_edges.length; ) {
                                if (node.out_edges[i].action.is_action_compatible(action)) {
                                        // Remove grant to child relations.
                                        this.dfs_remove_action(node.out_edges[i].dst, indi_set, action);
                                        // Remove grant on current relation.
                                        var src_ref = node_ref;
                                        var dst_ref = node.out_edges[i].dst;
                                        node.remove_grant_to(dst_ref, action);
                                        this.nodes[dst_ref].remove_grant_from(src_ref, action);
                                } else i ++;
                        }
                }
        }

        public revoke_action_to(src_ref: number, dst_ref: number, action: string): boolean
        {
                if (this.nodes[src_ref] == null ||
                    this.nodes[dst_ref] == null) 
                        return false;
        
                var indi_set = new Set();
                this.dfs_remove_action(dst_ref, indi_set, action);
        
                this.nodes[dst_ref].remove_grant_from(src_ref, action);
                this.nodes[src_ref].remove_grant_to(dst_ref, action);
        
                this.store();
                return true;
        }

        public add_root_action(action: string): boolean
        {
                if (this.nodes[0] == null) return false;
        
                this.nodes[0].grant_from(0, action, [0, -1], true);
                this.nodes[0].grant_to(0, action, [0, -1], true);
        
                this.store();
                return true;
        }

        public dfs_derive_action(node_ref: number, indi_set: Set<number>, 
                                 action: string, scope_set: Array<number>, with_grant_option: boolean): void
        {
                if (!indi_set.has(node_ref) && this.nodes[node_ref] != null) {
                        indi_set.add(node_ref);
                        var node = this.nodes[node_ref];
                        var old_len = node.out_edges.length;
                        for (var i = 0; i < old_len; i ++) {
                                // Grant on current relation.
                                var src_ref = node_ref;
                                var dst_ref = node.out_edges[i].dst;
                                node.grant_to(dst_ref, action, scope_set, with_grant_option);
                                this.nodes[dst_ref].grant_from(src_ref, action, scope_set, with_grant_option);
                                // Grant to child relations.
                                this.dfs_derive_action(node.out_edges[i].dst, indi_set,
                                                       action, scope_set, with_grant_option);
                        }
                }
        }

        public has_action2(node_ref: number, action: string, scope_set: Array<number>, need_grant_option: boolean): boolean
        {
                if (this.nodes[node_ref] == null)
                        return false;

                var priv_actions = this.nodes[node_ref].get_granted(action);
                for (var i = 0; i < priv_actions.length; i ++) {
                        if ((need_grant_option != true || priv_actions[i].has_grant_option()) &&
                             priv_actions[i].is_action_compatible(action) &&
                             priv_actions[i].is_inclusive_scope_set(scope_set))
                             return true;
                }
                return false;
        }

        public has_action(node_ref: number, action: string, scope_set: Array<number>): boolean 
        {
                return this.has_action2(node_ref, action, scope_set, false);
        }

        public has_action_from(src_ref: number, dst_ref: number, action: string, scope_set: Array<number>): boolean
        {
                if (this.nodes[src_ref] == null ||
                    this.nodes[dst_ref] == null)
                        return false;
                var priv_action = this.nodes[dst_ref].get_granted_from(src_ref, action);
                return priv_action != null &&
                       priv_action.is_action_compatible(action) &&
                       priv_action.is_inclusive_scope_set(scope_set);
        }

        public has_action_with_grant_option(node_ref: number, action: string, scope_set: Array<number>): boolean
        {
                return this.has_action2(node_ref, action, scope_set, true);
        }

        public derive_action_recursively_from(src_ref: number, dst_ref: number, 
                                              action: string, scope_set: Array<number>, with_grant_option: boolean): boolean
        {
                if (this.nodes[src_ref] == null ||
                    this.nodes[dst_ref] == null)
                        return false;
        
                this.nodes[dst_ref].grant_from(src_ref, action, scope_set, with_grant_option);
                this.nodes[src_ref].grant_to(dst_ref, action, scope_set, with_grant_option);
        
                var indi_set = new Set();
                this.dfs_derive_action(dst_ref, indi_set, action, scope_set, with_grant_option);
                this.store();
        
                return true;
        }

        public derive_action_from(src_ref: number, dst_ref: number, 
                                  action: string, scope_set: Array<number>, with_grant_option: boolean): boolean
        {
                if (this.nodes[src_ref] == null ||
                    this.nodes[dst_ref] == null ||
                    !this.has_action_with_grant_option(src_ref, action, scope_set))
                        return false;
        
                this.nodes[dst_ref].grant_from(src_ref, action, scope_set, with_grant_option);
                this.nodes[src_ref].grant_to(dst_ref, action, scope_set, with_grant_option);
        
                this.store();
                return true;
        }

        public modify_scope_on(src_ref: number, dst_ref: number, 
                               action: string, scope_set: Array<number>, with_grant_option: boolean): boolean
        {
                return this.derive_action_from(src_ref, dst_ref, action, scope_set, with_grant_option);
        }

        public get_all_actions(node_ref: number): Array<PrivilegeAction>
        {
                if (this.nodes[node_ref] == null)
                        return null;
                return this.nodes[node_ref].get_all_actions();
        }
};

