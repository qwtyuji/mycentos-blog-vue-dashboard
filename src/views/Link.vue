<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" @keyup.enter.native="getLinks" v-on:blur="getLinks" placeholder="查询"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getLinks">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd" v-show="auth.view_link">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="links" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="40">
            </el-table-column>
            <el-table-column type="expand" width="20">
                <template scope="props">
                    <el-form label-position="left" inline class="demo-table-expand">
                        <el-form-item label="描述:">
                            <span>{{ props.row.description }}</span>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column type="index" width="40">
            </el-table-column>
            <el-table-column prop="name" label="名称" sortable>
            </el-table-column>
            <el-table-column prop="url" label="链接" sortable>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" :formatter="formatStatus" sortable>
            </el-table-column>
            <el-table-column prop="updated_at" label="时间" sortable>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template scope="scope">
                    <el-button type="warning" size="small" @click="handleEdit(scope.$index, scope.row)" v-show="auth.edit_link">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)" v-show="auth.delete_link">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0" v-show="auth.delete_link">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="15" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--新增页面-->
        <el-dialog title="新增链接" v-model="addLinkVisible" :close-on-click-modal="false">
            <el-form :model="addLink" label-width="80px" :rules="addLinkRules" ref="addLink">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="addLink.name " auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="链接" prop="url">
                    <el-input v-model="addLink.url " auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="addLink.description"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="addLink.status">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addLinkVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑界面-->
        <el-dialog title="编辑链接" v-model="editLinkVisible" :close-on-click-modal="false">
            <el-form :model="editLink" label-width="80px" :rules="editLinkRules" ref="editLink">
                <el-form-item label="id" prop="id" hidden>
                    <el-input v-model="editLink.id" auto-complete="off" hidden></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editLink.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="链接" prop="url">
                    <el-input v-model="editLink.url" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="editLink.description"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="editLink.status">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editLinkVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import {
        getLinkListPage,
        addLink,
        editLink,
        removeLink,
        batchRemoveLink,
        checkLinkNameApi,
        errors
    } from '../api/api';
    export default {
        data() {
            var checkAddName = (rule, value, callback) => {
                let para = {name: this.addLink.name}
                checkLinkNameApi(para).then((res) => {
                    console.log(res.data.status)
                    if (!res.data.status) {
                        callback(new Error('名称已被占用!'));
                    } else {
                        callback();
                    }
                })
            };
            var checkEditName = (rule, value, callback) => {
                let para = {
                    id: this.editLink.id,
                    name: this.editLink.name
                }
                checkLinkNameApi(para).then((res) => {
                    console.log(res.data.status)
                    if (!res.data.status) {
                        callback(new Error('名称已被占用!'));
                    } else {
                        callback();
                    }
                })
            };
            return {
                auth: {
                    view_link: false,
                    add_link: false,
                    edit_link: false,
                    delete_link: false
                },
                cates: [],
                filters: {
                    keyword: ''
                },
                links: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                editLinkVisible: false, //编辑界面是否显示
                editLoading: false,
                addLinkVisible: false,//新增界面是否显示
                addLoading: false,
                //编辑界面数据
                editLink: {
                    id: '',
                    name: '',
                    url: '',
                    description: '',
                    status: '',
                },
                //新增界面数据
                addLink: {
                    name: '',
                    url: '',
                    description: '',
                    status: '',
                },
                addLinkRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'},
                        {validator: checkAddName, trigger: 'blur'},
                    ],
                },
                editLinkRules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'},
                        {validator: checkEditName, trigger: 'blur'}
                    ],
                },
            }

        },
        methods: {
            //显示转换
            formatStatus: function (row, column) {
                return row.status == '1' ? '启用' : row.status = '0' ? '禁用' : '未知';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getLinks();
            },
            //获取列表
            getLinks() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                let _this =this;
                this.listLoading = true;
                getLinkListPage(para).then((res) => {
                    this.total = res.data.total;
                    this.links = res.data.data;
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
            //删除
            handleDel: function (index, row) {
                let _this = this;
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {id: row.id};
                    removeLink(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getLinks();
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
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editLinkVisible = true;
                this.editLink = Object.assign({}, row);

            },
            //显示新增界面
            handleAdd: function () {

                this.addLinkVisible = true;
                this.addLink = {
                    name: '',
                    description: '',
                    status: 1,
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editLink.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            let _this = this;
                            this.editLoading = true;
                            let para = Object.assign({}, this.editLink);
                            editLink(para).then((res) => {
                                console.log(res)
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editLink'].resetFields();
                                this.editLinkVisible = false;
                                this.getLinks();
                            }).catch((rs) => {
                                _this.editLoading = false;
                                _this.$message({
                                    message: errors(rs).message,
                                    type: errors(rs).type,
                                    duration: errors(rs).duration
                                });
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addLink.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            let _this = this;
                            this.addLoading = true;
                            let para = Object.assign({}, this.addLink);
                            addLink(para).then((res) => {
                                console.log(res)
                                this.addLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addLink'].resetFields();
                                this.addLinkVisible = false;
                                this.getLinks();
                            }).catch((rs) => {
                                _this.addLoading = false;
                                _this.$message({
                                    message: errors(rs).message,
                                    type: errors(rs).type,
                                    duration: errors(rs).duration
                                });
                            });
                        });
                    }
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
                    batchRemoveLink(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: res.data.message,
                            type: 'success'
                        });
                        this.getLinks();
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
            this.getLinks();
        }
    }

</script>

<style scoped>
    .table {
        border: 1px solid #99a9bf;
        line-height: 2;
        width: 100%;
    }

    table > tr > td { border: 1px solid #99a9bf; padding-left: 10px; text-align: left }
</style>