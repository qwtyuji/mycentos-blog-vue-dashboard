<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" @keyup.enter.native="getCategories" v-on:blur="getCategories" placeholder="查询"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getCategories">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd" v-show="auth.view_category">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="categories" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" sortable>
            </el-table-column>
            <el-table-column prop="catename" label="上级分类" sortable>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" :formatter="formatStatus" sortable>
            </el-table-column>
            <el-table-column prop="updated_at" label="时间" sortable>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template scope="scope">
                    <el-button type="success" size="small"
                               @click="handleShow(scope.$index, scope.row)" v-show="auth.view_category">查看</el-button>
                    <el-button type="warning" size="small"
                               @click="handleEdit(scope.$index, scope.row)" v-show="auth.edit_category">编辑</el-button>
                    <el-button type="danger" size="small"
                               @click="handleDel(scope.$index, scope.row)" v-show="auth.delete_category">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0" v-show="auth.delete_category">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="15" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--新增页面-->
        <el-dialog title="新增分类" v-model="addCategoryVisible" :close-on-click-modal="false">
            <el-form :model="addCategory" label-width="80px" :rules="addCategoryRules" ref="addCategory">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="addCategory.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上级分类" prop="pid">
                    <el-select v-model="addCategory.pid" placeholder="选择分类">
                        <el-option :label="cate.name" :value="cate.id" v-for="cate in cates" :key="cate.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="关键词">
                    <el-input v-model="addCategory.keyword"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="addCategory.description"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="addCategory.status">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addCategoryVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑界面-->
        <el-dialog title="编辑分类" v-model="editCategoryVisible" :close-on-click-modal="false">
            <el-form :model="editCategory" label-width="80px" :rules="editCategoryRules" ref="editCategory">
                <el-form-item label="id" prop="id" hidden>
                    <el-input v-model="editCategory.id" auto-complete="off" hidden></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editCategory.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上级分类" prop="pid">
                    <el-select v-model="editCategory.pid" placeholder="选择分类">
                        <el-option :label="cate.name" :value="cate.id" v-for="cate in cates" :key="cate.id"></el-option>

                    </el-select>
                </el-form-item>
                <el-form-item label="关键词">
                    <el-input v-model="editCategory.keyword"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="editCategory.description"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="editCategory.status">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editCategoryVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <el-dialog title="显示详细" v-model="showCategoryVisible" :close-on-click-model="false">
            <div class="dialog-body">
                <table class="table">
                    <tr>
                        <td>名称:</td>
                        <td>{{ showCategory.name }}</td>
                    </tr>
                    <tr>
                        <td>上级分类:</td>
                        <td>{{ showCategory.catename }}</td>
                    </tr>
                    <tr>
                        <td>关键词:</td>
                        <td>{{ showCategory.keyword }}</td>
                    </tr>
                    <tr>
                        <td>状态:</td>
                        <td>{{ showCategory.status }}</td>
                    </tr>
                    <tr>
                        <td>描述:</td>
                        <td>{{ showCategory.description }}</td>
                    </tr>
                    <tr>
                        <td>修改时间:</td>
                        <td>{{ showCategory.updated_at }}</td>
                    </tr>
                    <tr>
                        <td>添加时间:</td>
                        <td>{{ showCategory.created_at }}</td>
                    </tr>
                </table>


            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="showCategoryVisible = false">关闭</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import {
        getCategoryListPage,
        getCategoryList,
        addCategory,
        editCategory,
        removeCategory,
        batchRemoveCategory,
        checkCateNameApi,
        errors
    } from '../api/api';
    export default {
        data() {
            var checkAddName = (rule, value, callback) => {
                let para = {name: this.addCategory.name}
                checkCateNameApi(para).then((res) => {
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
                    id: this.editCategory.id,
                    name: this.editCategory.name
                }
                checkCateNameApi(para).then((res) => {
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
                    view_category: false,
                    add_category: false,
                    edit_category: false,
                    delete_category: false
                },
                cates: [],
                filters: {
                    keyword: ''
                },
                categories: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                showCategoryVisible: false,//列表选中列
                editCategoryVisible: false, //编辑界面是否显示
                editLoading: false,
                //显示页面数据
                showCategory: {
                    id: '',
                    name: '',
                    catename: '',
                    keyword: '',
                    description: '',
                    status: '',
                },
                //编辑界面数据
                editCategory: {
                    id: '',
                    name: '',
                    pid: '',
                    keyword: '',
                    description: '',
                    status: '',
                },
                //新增界面数据
                addCategory: {
                    name: '',
                    pid: '',
                    keyword: '',
                    description: '',
                    status: '',
                },
                editCategoryRules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'},
                        {validator: checkEditName, trigger: 'blur'}
                    ],
                },
                addCategoryVisible: false,//新增界面是否显示
                addLoading: false,
                addCategoryRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'},
                        {validator: checkAddName, trigger: 'blur'},
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
                this.getCategories();
            },
            //获取列表
            getCategories() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                let _this = this;
                this.listLoading = true;
                getCategoryListPage(para).then((res) => {
                    this.total = res.data.total;
                    this.categories = res.data.data;
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
                this.showCategoryVisible = true;
                this.showCategory = Object.assign({}, row);
                this.showCategory.status = this.formatStatus(row);
            },
            //删除
            handleDel: function (index, row) {
                let _this = this;
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {id: row.id};
                    removeCategory(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getCategories();
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
                this.cates = [{name: '顶级分类', id: 0}]
                getCategoryList().then((res) => {
                    this.cates = this.cates.concat(res.data);
                });
                this.editCategoryVisible = true;
                this.editCategory = Object.assign({}, row);

            },
            //显示新增界面
            handleAdd: function () {
                this.cates = [{name: '顶级分类', id: 0}]
                getCategoryList().then((res) => {
                    this.cates = this.cates.concat(res.data);
                });
                this.addCategoryVisible = true;
                this.addCategory = {
                    name: '',
                    pid: '',
                    keyword: '',
                    description: '',
                    status: 1,
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editCategory.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            let _this = this;
                            this.editLoading = true;
                            let para = Object.assign({}, this.editCategory);
                            editCategory(para).then((res) => {
                                console.log(res)
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editCategory'].resetFields();
                                this.editCategoryVisible = false;
                                this.getCategories();
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
                this.$refs.addCategory.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            let _this = this;
                            this.addLoading = true;
                            let para = Object.assign({}, this.addCategory);
                            addCategory(para).then((res) => {
                                console.log(res)
                                this.addLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addCategory'].resetFields();
                                this.addCategoryVisible = false;
                                this.getCategories();
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
                    batchRemoveCategory(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: res.data.message,
                            type: 'success'
                        });
                        this.getCategories();
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
            //检测权限显示按钮
            checkAuth(){
                let auth = JSON.parse(sessionStorage.getItem('auth'));
                auth.map((rs) => {
                    this.auth.hasOwnProperty(rs.name) ? this.auth[rs.name] = true : '';
                })
            }
        },
        mounted() {
            this.checkAuth();
            this.getCategories();
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