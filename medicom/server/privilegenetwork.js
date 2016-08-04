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
import {Meteor} from "meteor/meteor";
import {Privilege} from "../api/privilege.js";

// PrivilegeAction
export function PrivilegeAction(node_ref, action, scope_set, with_grant_option)
{
        this.__action = action;
        this.__scope_set = scope_set;
        this.__with_grant_option = with_grant_option;

        if (scope_set != null)
                this.__replace_special_scope(this.__scope_set, node_ref);
}

// Parse special scopes.
PrivilegeAction.prototype.__replace_special_scope = function(scope_set, node_ref)
{
        for (var i = 0; i < scope_set.length; i ++)
                if (scope_set[i] == -2)
                        scope_set[i] = node_ref;
}

PrivilegeAction.prototype.get_action = function()
{
        return this.__action;
}

PrivilegeAction.prototype.get_scope_set = function()
{
        return this.__scope_set;
}

PrivilegeAction.prototype.set_grant_option = function(with_grant_option)
{
        this.__with_grant_option = with_grant_option;
}

PrivilegeAction.prototype.has_grant_option = function()
{
        return this.__with_grant_option;
}

PrivilegeAction.prototype.add_scope = function(scope, node_ref)
{
        this.__replace_special_scope(scope, node_ref);

        if (this.is_in_scope(scope))
                return false;
        this.__scope_set.push(scope);
}

PrivilegeAction.prototype.remove_scope = function(scope)
{
        var target = this.__scope_set.length;
        for (var i = 0; i < this.__scope_set.length; i ++) {
                if (this.__scope_set[i] == scope) {
                        target = i;
                        break;
                }
        }
        var last;
        for (last = target; last < this.__scope_set.length - 1; last ++)
                this.__scope_set[last] = this.__scope_set[last + 1];
        this.__scope_set = this.__scope_set.slice(last);
}

PrivilegeAction.prototype.is_in_scope = function(scope)
{
        for (var i = 0; i < this.__scope_set.length; i ++) {
                if (this.__scope_set[i] == -1 || this.__scope_set[i] == scope)
                        return true;
        }
        return false;
}

PrivilegeAction.prototype.is_inclusive_scope_set = function(scope_set)
{
        for (var i = 0; i < scope_set.length; i ++) {
                if (!this.is_in_scope(scope_set[i]))
                        return false;
        }
        return true;
}

PrivilegeAction.prototype.is_action_compatible = function(action)
{
        return this.__action == action;
}

export function PrivilegeAction_create_from_POD(pod)
{
        var obj = new PrivilegeAction();
        obj.__action = pod.__action;
        obj.__scope_set = pod.__scope_set;
        obj.__with_grant_option = pod.__with_grant_option;
        return obj;
}

// PrivilegeEdge
function PrivilegeEdge(src, dst, action)
{
        this.__src = src;
        this.__dst = dst;
        this.__action = action;
}

function PrivilegeEdge_create_from_POD(pod)
{
        var obj = new PrivilegeEdge();
        obj.__src = obj.__src;
        obj.__dst = obj.__dst;
        obj.__action = PrivilegeAction_create_from_POD(pod.__action);
        return obj;
}

// PrivilegeNode
function PrivilegeNode(node_ref)
{
        this.__node_ref = node_ref;
        this.__in_edges = [];
        this.__out_edges = [];
}

PrivilegeNode.prototype.__remove_action = function(edge_set, src, dst, action)
{
        var num_removed = 0;
        for (var i = 0, j = 0; j < edge_set.length; j ++) {
                if (edge_set[j].__action.is_action_compatible(action) &&
                    edge_set[j].__src == src &&
                    edge_set[j].__dst == dst) {
                        num_removed ++;
                        continue;
                } else
                        edge_set[i ++] = edge_set[j];
        }
        return edge_set.slice(edge_set.length - num_removed);
}

PrivilegeNode.prototype.__remove_all_action = function(edge_set, action)
{
        var num_removed = 0;
        for (var i = 0, j = 0; j < edge_set.length; j ++) {
                if (edge_set[j].__action.is_action_compatible(action)) {
                        num_removed ++;
                        continue;
                } else
                        edge_set[i ++] = edge_set[j];
        }
        return edge_set.slice(edge_set.length - num_removed);
}

PrivilegeNode.prototype.__get_action = function(edge_set, action)
{
        for (var i = 0; i < edge_set.length; i ++) {
                if (edge_set[i].__action.is_action_compatible(action))
                        return edge_set[i].__action;
        }
        return null;
}

PrivilegeNode.prototype.__get_action_with = function(edge_set, src, dst, action)
{
        for (var i = 0; i < edge_set.length; i ++) {
                if (edge_set[i].__action.is_action_compatible(action) &&
                    edge_set[i].__src == src &&
                    edge_set[i].__dst == dst)
                        return edge_set[i].__action;
        }
        return null;
}

PrivilegeNode.prototype.__add_action = function(edge_set, src, dst, action, scope_set, with_grant_option)
{
        var priv_action = this.__get_action_with(edge_set, src, dst, action);
        if (priv_action == null)
                edge_set.push(new PrivilegeEdge(src, dst,
                                                new PrivilegeAction(this.__node_ref,
                                                                    action, scope_set, with_grant_option)));
        else {
                for (var i = 0; i < scope_set.length; i ++)
                        priv_action.add_scope(scope_set[i], this.__node_ref);
                priv_action.set_grant_option(with_grant_option);
        }
}

PrivilegeNode.prototype.get_granted = function(action)
{
        return this.__get_action(this.__in_edges, action);
}

PrivilegeNode.prototype.get_granted_from = function(src_ref, action)
{
        return this.__get_action_with(this.__in_edges,
                                      src_ref,
                                      this.__node_ref,
                                      action);
}

PrivilegeNode.prototype.get_granting = function(action)
{
        return this.__get_action(this.__out_edges, action);
}

PrivilegeNode.prototype.get_all_actions = function(action)
{
        var actions = [];
        for (var i = 0; i < this.__in_edges.length; i ++)
                actions.push(this.__in_edges[i].__action);
        return actions;
}

PrivilegeNode.prototype.remove_grant_from = function(src, action)
{
        this.__in_edges = this.__remove_action(this.__in_edges,
                                               src,
                                               this.__node_ref,
                                               action);
}

PrivilegeNode.prototype.remove_grant_to = function(dst, action)
{
        this.__out_edges = this.__remove_action(this.__out_edges,
                                                this.__node_ref,
                                                dst,
                                                action);
}

PrivilegeNode.prototype.remove_granted_all = function(action)
{
        this.__in_edges = this.__remove_all_action(this.__in_edges, action);
}

PrivilegeNode.prototype.remove_granting_all = function(action)
{
        this.__out_edges = this.__remove_all_action(this.__out_edges, action);
}

PrivilegeNode.prototype.grant_from = function(src, action, scope_set, with_grant_option)
{
        this.__add_action(this.__in_edges, src, this.__node_ref,
                          action, scope_set, with_grant_option);
}

PrivilegeNode.prototype.grant_to = function(dst, action, scope_set, with_grant_option)
{
        this.__add_action(this.__out_edges, this.__node_ref, dst,
                          action, scope_set, with_grant_option);
}

function PrivilegeNode_create_from_POD(pod)
{
        var obj = new PrivilegeNode();
        obj.__node_ref = pod.__node_ref;
        obj.__in_edges = pod.__in_edges;
        obj.__out_edges = pod.__out_edges;

        for (var i = 0; i < obj.__in_edges.length; i ++)
                obj.__in_edges[i] = PrivilegeEdge_create_from_POD(obj.__in_edges[i]);

        for (var i = 0; i < obj.__out_edges.length; i ++)
                obj.__out_edges[i] = PrivilegeEdge_create_from_POD(obj.__out_edges[i]);

        return obj;
}

// PrivilegeNetwork
export function PrivilegeNetwork()
{
        this.__storage = new Mongo.Collection("PrivilegeNetworkCollection");
        this.__nodes = [];              // ref 0 is reserved.for the root.
        this.__recycled = [];

        this.__restore();
}

PrivilegeNetwork.prototype.__restore = function()
{
        var result = this.__storage.find({});
        if (result.count() > 0) {
                var mem = result.fetch()[0];
                this.__recycled = mem.recycled;
                for (var i = 0; i < mem.nodes.length; i ++)
                        if (mem.nodes[i] != null)
                                this.__nodes[i] = PrivilegeNode_create_from_POD(mem.nodes[i]);
        } else {
                this.__recycled = [];
                this.__nodes = [];
                this.allocate_root();
        }
        this.__store();
}

PrivilegeNetwork.prototype.__store = function()
{
        this.__storage.remove({});
        this.__storage.insert({nodes: this.__nodes, recycled: this.__recycled});
}

PrivilegeNetwork.prototype.reset = function()
{
        this.__storage.remove({});
        this.__nodes = [null];
        this.__recycled = [];
}

PrivilegeNetwork.prototype.allocate_root = function()
{
        if (this.__nodes[0] == null) {
                this.__nodes[0] = new PrivilegeNode(0);
                this.__store();
        }
        return 0;
}

PrivilegeNetwork.prototype.allocate = function()
{
        var allocated;
        if (this.__recycled.length == 0)
                allocated = this.__nodes.length;
        else
                allocated = this.__recycled.pop();
        this.__nodes[allocated] = new PrivilegeNode(allocated);
        this.__store();
        return allocated;
}

PrivilegeNetwork.prototype.__dfs_remove_depended_nodes = function(node_ref, indi_set)
{
        if (!indi_set.has(node_ref) && this.__nodes[node_ref] != null) {
                indi_set.add(node_ref);
                var node = this.__nodes[node_ref];
                for (var i = 0; i < node.__out_edges.length; i ++)
                        this.__dfs_remove_depended_nodes(node.__out_edges[i], indi_set);
                this.__nodes[node_ref] = null;
                this.__recycled.push(node_ref);
        }
}

PrivilegeNetwork.prototype.free = function(node_ref)
{
        if (this.__nodes[node_ref] == null)
                return false;

        var indi_set = new Set();
        this.__dfs_remove_depended_nodes(node_ref, indi_set);

        if (node_ref == 0)
                // Root is always none empty.
                this.allocate_root();

        this.__store();
        return true;
}

PrivilegeNetwork.prototype.__dfs_remove_action = function(node_ref, indi_set, action)
{
        if (!indi_set.has(node_ref) && this.__nodes[node_ref] != null) {
                indi_set.add(node_ref);
                var node = this.__nodes[node_ref];
                for (var i = 0; i < node.__out_edges.length; ) {
                        if (node.__out_edges[i].__action.is_action_compatible(action)) {
                                // Remove grant to child relations.
                                this.__dfs_remove_action(node.__out_edges[i], indi_set, action);
                                // Remove grant on current relation.
                                var src_ref = node_ref;
                                var dst_ref = node.__out_edges[i];
                                node.remove_grant_to(dst_ref, action);
                                this.__nodes[dst_ref].remove_grant_from(src_ref, action);
                        } else i ++;
                }
        }
}

PrivilegeNetwork.prototype.revoke_action_to = function(src_ref, dst_ref, action)
{
        if (this.__nodes[node_ref] == null) return false;

        var indi_set = new Set();
        this.__dfs_remove_action(dst_ref, indi_set, action);

        this.__nodes[dst_ref].remove_grant_from(src_ref, action);
        this.__nodes[src_ref].remove_grant_to(dst_ref, action);

        this.__store();
        return true;
}

PrivilegeNetwork.prototype.add_root_action = function(action)
{
        if (this.__nodes[0] == null) return false;

        this.__nodes[0].grant_from(0, action, [0, -1], true);
        this.__nodes[0].grant_to(0, action, [0, -1], true);

        this.__store();
        return true;
}

PrivilegeNetwork.prototype.__dfs_derive_action = function(node_ref, indi_set, action, scope_set, with_grant_option)
{
        if (!indi_set.has(node_ref) && this.__nodes[node_ref] != null) {
                indi_set.add(node_ref);
                var node = this.__nodes[node_ref];
                var old_len = nodes.__out_edges.length;
                for (var i = 0; i < old_len; i ++) {
                        // Grant on current relation.
                        var src_ref = node_ref;
                        var dst_ref = node.__out_edges[i];
                        node.grant_to(src_ref, dst_ref, action, scope_set, with_grant_option);
                        this.__nodes[dst_ref].grant_from(src_ref, dst_ref, action, scope_set, with_grant_option);
                        // Grant to child relations.
                        this.__dfs_derive_action(node.__out_edges[i], indi_set,
                                                 action, scope_set, with_grant_option);
                }
        }
}

PrivilegeNetwork.prototype.has_action = function(node_ref, action, scope_set)
{
        if (this.__nodes[node_ref] == null)
                return false;
        var priv_action = this.__nodes[node_ref].get_granted(action);
        return priv_action != null &&
               priv_action.is_action_compatible(action) &&
               priv_action.is_inclusive_scope_set(scope_set);
}

PrivilegeNetwork.prototype.has_action_from = function(src_ref, dst_ref, action, scope_set)
{
        if (this.__nodes[src_ref] == null ||
            this.__nodes[dst_ref] == null)
                return false;
        var priv_action = this.__nodes[dst_ref].get_granted_from(src_ref, action);
        return priv_action != null &&
               priv_action.is_action_compatible(action) &&
               priv_action.is_inclusive_scope_set(scope_set);
}

PrivilegeNetwork.prototype.has_action_with_grant_option = function(node_ref, action, scope_set)
{
        if (this.__nodes[node_ref] == null)
                return false;
        var priv_action = this.__nodes[node_ref].get_granted(action);
        return priv_action != null &&
               priv_action.has_grant_option() &&
               priv_action.is_action_compatible(action) &&
               priv_action.is_inclusive_scope_set(scope_set);
}

PrivilegeNetwork.prototype.derive_action_recursively_from = function(src_ref, dst_ref, action, scope_set, with_grant_option)
{
        if (this.__nodes[src_ref] == null ||
            this.__nodes[dst_ref] == null)
                return false;

        this.__nodes[dst_ref].grant_from(src_ref, action, scope_set, with_grant_option);
        this.__nodes[src_ref].grant_to(dst_ref, action, scope_set, with_grant_option);

        var indi_set = new Set();
        this.__dfs_derive_action(dst_ref, indi_set, action, scope_set, with_grant_option);
        this.__store();

        return true;
}

PrivilegeNetwork.prototype.derive_action_from = function(src_ref, dst_ref, action, scope_set, with_grant_option)
{
        if (this.__nodes[src_ref] == null ||
            this.__nodes[dst_ref] == null ||
            !this.has_action_with_grant_option(src_ref, action, scope_set))
                return false;

        this.__nodes[dst_ref].grant_from(src_ref, action, scope_set, with_grant_option);
        this.__nodes[src_ref].grant_to(dst_ref, action, scope_set, with_grant_option);

        this.__store();
        return true;
}

PrivilegeNetwork.prototype.modify_scope_on = function(src_ref, dst_ref, action, scope_set, with_grant_option)
{
        return this.derive_action_from(src_ref, dst_ref, action, scope_set, with_grant_option);
}

//PrivilegeNetwork.prototype.get_action = function(node_ref, action)
//{
//        if (this.__nodes[node_ref] == null)
//                return null;
//        return this.__nodes[node_ref].get_granted(action);
//}

PrivilegeNetwork.prototype.get_action_from = function(src_ref, dst_ref, action)
{
        if (this.__nodes[src_ref] == null ||
            this.__nodes[dst_ref] == null)
                return null;
        return this.__nodes[dst_ref].get_granted_from(src_ref, action);
}

PrivilegeNetwork.prototype.get_all_actions = function(node_ref)
{
        if (this.__nodes[node_ref] == null)
                return null;
        return this.__nodes[node_ref].get_all_actions();
}
