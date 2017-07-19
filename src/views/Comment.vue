<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" @keyup.enter.native="getComments" v-on:blur="getComments" placeholder="查询"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getComments">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="comments" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <!--<el-table-column type="index" width="60">-->
            <!--</el-table-column>-->
            <el-table-column type="expand" label="数据">
                <template scope="props">
                    <el-form label-position="left" inline class="demo-table-expand">
                        <el-form-item label="内容:">
                            <span>{{ props.row.body }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column prop="user.name" label="用户" sortable>
            </el-table-column>
            <el-table-column prop="article.title" label="所属文章" sortable>
            </el-table-column>
            <el-table-column prop="body" label="内容" sortable>
            </el-table-column>
            <el-table-column prop="created_at" label="时间" sortable>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template scope="scope">
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)" v-show="auth.delete_comment">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0" v-show="auth.delete_comment">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="15" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
    import {
        getCommentListPage,
        removeComment,
        batchRemoveComment,
        errors
    } from '../api/api';
    export default {
        data() {
            return {
                auth: {
                    view_comment: false,
                    delete_comment: false
                },
                cates: [],
                filters: {
                    keyword: ''
                },
                comments: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                showCommentVisible: false,//列表选中列

            }

        },
        methods: {
            //显示转换
            formatStatus: function (row, column) {
                return row.status == '1' ? '启用' : row.status = '0' ? '禁用' : '未知';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getComments();
            },
            //获取列表
            getComments() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                let _this =this;
                this.listLoading = true;
                getCommentListPage(para).then((res) => {
                    this.total = res.data.total;
                    this.comments = res.data.data;
                    this.listLoading = false;
                }).catch((rs) => {
                    _this.listLoading = false;
                    _this.$message({
                        message: errors(rs).message,
                        type: errors(rs).type,
                        duration: errors(rs).duration
                    });
                });
            },
            //显示
            handleShow: function (index, row) {
                this.showCommentVisible = true;
                this.showComment = Object.assign({}, row);
                this.showComment.status = this.formatStatus(row);
            },
            //删除
            handleDel: function (index, row) {
                let _this = this;
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {id: row.id};
                    removeComment(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getComments();
                    });
                }).catch((rs) => {
                    _this.listLoading = false;
                    _this.$message({
                        message: errors(rs).message,
                        type: errors(rs).type,
                        duration: errors(rs).duration
                    });
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                let _this = this;
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {ids: ids};
                    batchRemoveComment(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getComments();
                    });
                }).catch((rs) => {
                    _this.listLoading = false;
                    _this.$message({
                        message: errors(rs).message,
                        type: errors(rs).type,
                        duration: errors(rs).duration
                    });
                });
            },
            checkAuth(){
                let auth = JSON.parse(sessionStorage.getItem('auth'));
                auth.map((rs) => {
                    this.auth.hasOwnProperty(rs.name) ? this.auth[rs.name] = true : '';
                })
            }
        },
        mounted() {
            this.checkAuth();
            this.getComments();
        }
    }

</script>

<style scoped>
</style>