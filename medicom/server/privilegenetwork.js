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

function PrivilegeEdge(src, dst, action) {
        this.__src = src;
        this.__dst = dst;
        this.__action = action;
}

function PrivilegeNode(node_ref, account_id, agent) {
        this.__node_ref = node_ref;
        this.__account_id = account_id;
        this.__agent = agent;
        this.__in_edges = [];
        this.__out_edges = [];

        this.__remove_action = function(edge_set, src, dst, action) {
                var num_removed = 0;
                for (var i = 0, j = 0; j < edge_set.length; j ++) {
                        if (edge_set[j].__action == action &&
                            edge_set[j].__src == src &&
                            edge_set[j].__dst == dst) {
                                num_removed ++;
                                continue;
                        } else {
                                edge_set[i ++] = edge_set[j];
                        }
                }
                return edge_set.slice(edge_set.length - num_removed);
        }

        this.__remove_all_action = function(edge_set, action) {
                var num_removed = 0;
                for (var i = 0, j = 0; j < edge_set.length; j ++) {
                        if (edge_set[j].__action == action) {
                                num_removed ++;
                                continue;
                        } else {
                                edge_set[i ++] = edge_set[j];
                        }
                }
                return edge_set.slice(edge_set.length - num_removed);
        }

        this.__has_action = function(edge_set, action) {
                for (var i = 0; i < edge_set.length; i ++) {
                        if (edge_set[i].__action == action)
                                return true;
                }
                return false;
        }

        this.__has_action_with = function(edge_set, src, dst, action) {
                for (var i = 0; i < edge_set.length; i ++) {
                        if (edge_set[i].__action == action &&
                            edge_set[i].__src == src &&
                            edge_set[i].__dst == dst)
                                return true;
                }
                return false;
        }

        this.__add_action = function(edge_set, src, dst, action) {
                if (!this.__has_action_with(edge_set, src, dst, action)) {
                        edge_set[edge_set.length] = new PrivilegeEdge(src, dst, action);
                }
        }

        this.has_granted = function(action) {
                return this.__has_action(this.__in_edges, action);
        }

        this.has_granting = function(action) {
                return this.__has_action(this.__out_edges, action);
        }

        this.remove_grant_from = function(src, action) {
                this.__in_edges = this.__remove_action(this.__in_edges, src, this.__node_ref, action);
        }

        this.remove_grant_to = function(dst, action) {
                this.__out_edges = this.__remove_action(this.__out_edges, this.__node_ref, dst, action);
        }

        this.remove_granted_all = function(action) {
                this.__in_edges = this.__remove_all_action(this.__in_edges, action);
        }

        this.remove_granting_all = function(action) {
                this.__out_edges = this.__remove_all_action(this.__out_edges, action);
        }

        this.grant_from = function(src, action) {
                this.__add_action(this.__in_edges, src, this.__node_ref, action);
        }

        this.grant_to = function(dst, action) {
                this.__add_action(this.__out_edges, this.__node_ref, dst, action);
        }
}

function PrivilegeNode_create_from_POD(pod) {
        var obj = new PrivilegeNode();
        obj.__node_ref = pod.__node_ref;
        obj.__account_id = pod.__account_id;
        obj.__agent = pod.__agent;
        obj.__in_edges = pod.__in_edges;
        obj.__out_edges = pod.__out_edges;
        return obj;
}

export function PrivilegeNetwork() {
        this.__storage = new Mongo.Collection("PrivilegeNetworkCollection");
        this.__nodes = [null];  // ref 0 is reserved.

        this.__restore = function() {
                var result = this.__storage.find({});
                if (result.count() > 0) {
                        var nodes = result.fetch()[0].nodes;
                        for (var i = 0; i < nodes.length; i ++) {
                                this.nodes[i] = PrivilegeNode_create_from_POD(nodes[i]);
                        }
                }
        }

        this.__store = function() {
                this.__storage.remove({});
                this.__storage.insert({nodes: this.__nodes});
        }

        // init.
        this.__restore();

        this.reset = function() {
                this.__storage.remove({});
        }

        this.allocate = function(account_id, agent) {
                var allocated = this.nodes.length;
                this.__nodes[allocated] = new PrivilegeNode(allocated, account_id, agent);
                this.__store();
                return allocated;
        }

        this.__dfs_remove_depended_nodes = function(node_ref, indi_set) {
                if (!indi_set.has(node_ref) && this.__nodes[node_ref] != null) {
                        indi_set.add(node_ref);
                        var node = this.__nodes[node_ref];
                        for (var i = 0; i < node.__out_edges.length; i ++) {
                                this.__dfs_remove_depended_nodes(node.__out_edges[i], indi_set);
                        }
                        this.__nodes[node_ref] = null;
                }
        }

        this.free = function(node_ref) {
                if (this.__nodes[node_ref] == null) return false;

                var indi_set = new Set();
                this.__dfs_remove_depended_nodes(node_ref, indi_set);

                this.__store();
                return true;
        }

        this.__dfs_remove_action = function(node_ref, indi_set, action) {
                if (!indi_set.has(node_ref) && this.__nodes[node_ref] != null) {
                        indi_set.add(node_ref);
                        var node = this.__nodes[node_ref];
                        for (var i = 0; i < node.__out_edges.length; ) {
                                if (node.__out_edges[i].__action == action) {
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

        this.revoke_action_to = function(src_ref, dst_ref, action) {
                if (this.__nodes[node_ref] == null) return false;

                var indi_set = new Set();
                this.__dfs_remove_action(dst_ref, indi_set, action);

                this.__nodes[dst_ref].remove_grant_from(src_ref, action);
                this.__nodes[src_ref].remove_grant_to(dst_ref, action);

                this.__store();
                return true;
        }

        this.set_singleton_action = function(node_ref, action) {
                if (this.__nodes[node_ref] == null) return false;

                this.__nodes[node_ref].grant_from(node_ref, action);
                this.__nodes[node_ref].grant_to(node_ref, action);

                this.__store();
                return true;
        }

        this.__dfs_derive_action = function(node_ref, indi_set, action) {
                if (!indi_set.has(node_ref) && this.__nodes[node_ref] != null) {
                        indi_set.add(node_ref);
                        var node = this.__nodes[node_ref];
                        var old_len = nodes.__out_edges.length;
                        for (var i = 0; i < old_len; i ++) {
                                // Grant on current relation.
                                var src_ref = node_ref;
                                var dst_ref = node.__out_edges[i];
                                node.grant_to(src_ref, dst_ref, action);
                                this.__nodes[dst_ref].grant_from(src_ref, dst_ref, action);
                                // Grant to child relations.
                                this.__dfs_derive_action(node.__out_edges[i], indi_set, action);
                        }
                }
        }

        this.derive_action_recursive_from = function(src_ref, dst_ref, action) {
                if (this.__nodes[node_ref] == null) return false;

                this.__nodes[dst_ref].grant_from(src_ref, action);
                this.__nodes[src_ref].grant_to(dst_ref, action);

                var indi_set = new Set();
                this.__dfs_derive_action(dst_ref, indi_set, action);
                this.__store();

                return true;
        }

        this.derive_action_from = function(src_ref, dst_ref, action) {
                if (this.__nodes[node_ref] == null) return false;

                this.__nodes[dst_ref].grant_from(src_ref, action);
                this.__nodes[src_ref].grant_to(dst_ref, action);

                this.__store();
                return true;
        }

        this.has_action = function(node_ref, action) {
                return this.__nodes[node_ref] != null && this.__nodes[node_ref].has_action();
        }

        this.reset = function() {
                this.__storage.remove({});
        }
}
