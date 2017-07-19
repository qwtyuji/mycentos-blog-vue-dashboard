<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" @keyup.enter.native="getArticles" v-on:blur="getArticles" placeholder="查询"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getArticles">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd" v-show="auth.add_article">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="articles" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">

            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="title" label="标题" sortable>
            </el-table-column>
            <el-table-column prop="category.name" label="分类" sortable>
            </el-table-column>
            <el-table-column prop="tag" label="标签" sortable :formatter="formatTags">
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" :formatter="formatStatus" sortable>
            </el-table-column>
            <el-table-column prop="updated_at" label="修改时间" sortable>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" sortable>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template scope="scope">
                    <el-button type="success" size="small" @click="handleShow(scope.$index, scope.row)" v-show="auth.view_article">查看</el-button>
                    <el-button type="warning" size="small" @click="handleEdit(scope.$index, scope.row)" v-show="auth.edit_article">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)" v-show="auth.delete_article">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0" v-show="auth.delete_article">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="15" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--新增页面-->
        <el-dialog title="新增文章" size="full" v-model="addArticleVisible" :close-on-click-modal="false">
            <el-form :model="addArticle" label-width="80px" :rules="addArticleRules" ref="addArticle">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="addArticle.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category_id">
                    <el-select v-model="addArticle.category_id" placeholder="选择分类">
                        <el-option :label="cate.name" :value="cate.id" v-for="cate in cates" :key="cate.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标签" prop="tag">
                    <el-select style="width: 100%" v-model="addArticle.tag" multiple filterable allow-create placeholder="请选择文章标签">
                        <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="关键词" prop="keywords">
                    <el-input v-model="addArticle.keywords"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="addArticle.description"></el-input>
                </el-form-item>
                <el-form-item label="略缩图">
                    <el-upload
                            action="http://app.dev/api/article/pic"
                            :headers="headers"
                            :on-success="handleAddSuccess"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="addArticle.piclist"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="addArticle.status">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <mavon-editor v-model="addArticle.content" :toolbars="toolbars" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addArticleVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑界面-->
        <el-dialog title="编辑文章" size="full" v-model="editArticleVisible" :close-on-click-modal="false">
            <el-form :model="editArticle" label-width="80px" :rules="editArticleRules" ref="editArticle">
                <el-form-item label="id" prop="id" hidden>
                    <el-input v-model="editArticle.id" auto-complete="off" hidden></el-input>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="editArticle.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category_id">
                    <el-select v-model="editArticle.category_id" placeholder="选择分类">
                        <el-option :label="cate.name" :value="cate.id" v-for="cate in cates" :key="cate.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标签">
                    <el-select style="width: 100%" v-model="editArticle.tag"  multiple filterable allow-create placeholder="请选择文章标签">
                        <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="关键词" prop="keywords">
                    <el-input v-model="editArticle.keywords"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="editArticle.description"></el-input>
                </el-form-item>
                <el-form-item label="图片地址" prop="pic" hidden>
                    <el-input v-model="editArticle.pic"></el-input>
                </el-form-item>
                <el-form-item label="略缩图">
                    <el-upload
                            action="http://app.dev/api/article/pic"
                            :headers="headers"
                            :on-success="handleEditSuccess"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="editArticle.piclist"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="editArticle.status">
                        <el-radio class="radio" :label="1">启用</el-radio>
                        <el-radio class="radio" :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <mavon-editor v-model="editArticle.content" :toolbars="toolbars" />
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editArticleVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--显示界面-->
        <el-dialog title="显示详细" v-model="showArticleVisible" :close-on-click-model="false">
            <div class="dialog-body">
                <table class="table">
                    <tr>
                        <td>名称:</td>
                        <td>{{ showArticle.title }}</td>
                    </tr>
                    <tr>
                        <td>分类:</td>
                        <td>{{ showArticle.category.name }}</td>
                    </tr>

                    <tr>
                        <td>关键词:</td>
                        <td>{{ showArticle.keywords }}</td>
                    </tr>
                    <tr>
                        <td>描述:</td>
                        <td>{{ showArticle.description }}</td>
                    </tr>
                    <tr>
                        <td>略缩图:</td>
                        <td>
                            <img :src="showArticle.pic" alt="">
                        </td>
                    </tr>
                    <tr>
                        <td>状态:</td>
                        <td>{{ showArticle.status }}</td>
                    </tr>
                    <tr>
                        <td>内容:</td>
                        <td>{{ showArticle.content }}</td>
                    </tr>
                    <tr>
                        <td>标签:</td>
                        <td>
                            <ul>
                                <li v-for="tag in showArticle.tag">{{tag.name}}</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>修改时间:</td>
                        <td>{{ showArticle.updated_at }}</td>
                    </tr>
                    <tr>
                        <td>添加时间:</td>
                        <td>{{ showArticle.created_at }}</td>
                    </tr>
                </table>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="showArticleVisible = false">关闭</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import {
        getArticleListPage,
        getCategoryList,
        getTagList,
        addArticle,
        editArticle,
        removeArticle,
        batchRemoveArticle,
        checkArticleNameApi,
        errors
    } from '../api/api';
    export default {
        data() {
            var checkAddName = (rule, value, callback) => {
                let para = {title: this.addArticle.title}
                checkArticleNameApi(para).then((res) => {
                    console.log(res.data.status)
                    if (!res.data.status) {
                        callback(new Error('文章标题已占用!'));
                    } else {
                        callback();
                    }
                })
            };
            var checkEditName = (rule, value, callback) => {
                let para = {
                    id: this.editArticle.id,
                    title: this.editArticle.title
                }
                checkArticleNameApi(para).then((res) => {
                    console.log(res.data.status)
                    if (!res.data.status) {
                        callback(new Error('文章标题已占用!'));
                    } else {
                        callback();
                    }
                })
            };
            return {
                auth: {
                    view_article: false,
                    add_article: false,
                    edit_article: false,
                    delete_article: false
                },
                //传入access_token 不然没有权限
                headers:{
                    'Authorization':'Bearer '+sessionStorage.getItem('access_token')
                },
                toolbars: {
                    bold: true, // 粗体
                    italic: true, // 斜体
                    header: true, // 标题
                    strikethrough: true, // 中划线
                    mark: true, // 标记
                    superscript: true, // 上角标
                    subscript: true, // 下角标
                    quote: true, // 引用
                    ol: true, // 有序列表
                    ul: true, // 无序列表
                    link: true, // 链接
                    imagelink: true, // 图片链接
                    code: true, // code
                    table: true, // 表格
                    subfield: true, // 是否需要分栏
                    readmodel: true, // 沉浸式阅读
                    htmlcode: true, // 展示html源码
                    /* 1.4.2 */
                    navigation: true // 导航目录
                },
                cates: [],
                tags: [],
                filters: {keyword: ''},
                articles: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                showArticleVisible: false,//列表选中列
                editArticleVisible: false, //编辑界面是否显示
                editLoading: false,
                //显示页面数据
                showArticle: {
                    id: '',
                    title: '',
                    category: '',
                    keywords: '',
                    content: '',
                    description: '',
                    status: '',
                },
                //新增界面数据
                addArticle: {
                    title: '',
                    category_id: '',
                    keywords: '',
                    content: '',
                    tag: [],
                    description: '',
                    status: '',
                    pic: '',
                    piclist: [],
                },
                addArticleVisible: false,//新增界面是否显示
                addLoading: false,
                addArticleRules: {
                    title: [
                        {required: true, message: '请输入标题', trigger: 'blur'},
                        {validator: checkAddName, trigger: 'blur'},
                    ],
                },
                //编辑界面数据
                editArticle: {
                    id: '',
                    title: '',
                    category_id: '',
                    keywords: '',
                    content: '',
                    tag: [],
                    description: '',
                    status: '',
                    piclist: [],
                    pic: '',
                },
                editArticleRules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'},
                        {validator: checkEditName, trigger: 'blur'}
                    ],
                },

            }
        },
        methods: {
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            handleAddSuccess(res, file, fileList){
                if(res.status){
                    this.$message({
                        message: res.message,
                        type: 'success'
                    });
                    this.addArticle.pic = res.data;
                }else{
                    this.$message({
                        message: res.message,
                        type: 'error'
                    });
                }

            },
            handleEditSuccess(res, file, fileList){
                if(res.status){
                    this.$message({
                        message: res.message,
                        type: 'success'
                    });
                    this.editArticle.pic = res.data;
                }else{
                    this.$message({
                        message: res.message,
                        type: 'error'
                    });
                }
            },
            //状态转换
            formatStatus: function (row, column) {
                return row.status == '1' ? '启用' : row.status = '0' ? '禁用' : '未知';
            },
            //标签转换
            formatTags: function (row, column) {
                let tagsname = ''
                for (let v of row.tag) {
                    tagsname += v.name + ' '
                }
                return tagsname
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getArticles();
            },
            //列表
            getArticles() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                let _this =this;
                this.listLoading = true;
                getArticleListPage(para).then((res) => {
                    this.total = res.data.total;
                    this.articles = res.data.data;
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
            //详细
            handleShow: function (index, row) {
                this.showArticleVisible = true;
                this.showArticle = Object.assign({}, row);
                this.showArticle.status = this.formatStatus(row);
            },
            //新增界面
            handleAdd: function () {
                this.cates = [];
                this.tags = [];
                getCategoryList().then((res) => {
                    this.cates = this.cates.concat(res.data);
                });
                getTagList().then((res) => {
                    this.tags = this.tags.concat(res.data);
                });
                this.addArticleVisible = true;
                this.addArticle = {
                    title: '',
                    category_id: '',
                    keywords: '',
                    description: '',
                    tag: [],
                    content: '',
                    status: 1,
                    pic: '',
                };
            },
            //编辑界面
            handleEdit: function (index, row) {
                getCategoryList().then((res) => {
                    this.cates = res.data;
                });
                getTagList().then((res) => {
                    this.tags = res.data;
                });
                this.editArticleVisible = true;
                this.editArticle = Object.assign({}, row);
                this.editArticle.tag = row.tag.map(item=>item.id);
                if(this.editArticle.pic !==null){
                    this.editArticle.piclist = [{'url': this.editArticle.pic}]
                }
            },
            //新增
            addSubmit: function () {
                this.$refs.addArticle.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            let _this = this;
                            this.addLoading = true;
                            let para = Object.assign({}, this.addArticle);
                            console.log(para);
                            addArticle(para).then((res) => {
                                this.addLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addArticle'].resetFields();
                                this.addArticle.piclist = [];
                                this.addArticleVisible = false;
                                this.getArticles();
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
            //编辑
            editSubmit: function () {
                this.$refs.editArticle.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            let _this = this;
                            this.editLoading = true;

                            let para = Object.assign({}, this.editArticle);
                            console.log(para);
                            editArticle(para).then((res) => {
                                console.log(res)
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editArticle'].resetFields();
                                this.editArticleVisible = false;
                                this.getArticles();
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
            //删除
            handleDel: function (index, row) {
                let _this =this;
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {id: row.id};
                    removeArticle(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getArticles();
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
                let _this =this;
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {ids: ids};
                    batchRemoveArticle(para).then((res) => {
                        this.listLoading = false;
                        this.$message({
                            message: res.data.message,
                            type: 'success'
                        });
                        this.getArticles();
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
                if(auth){
                    auth.map((rs) => {
                        this.auth.hasOwnProperty(rs.name) ? this.auth[rs.name] = true : '';
                    })
                }else{
                    console.log('auth is not init')
                }

            }
        },
        mounted() {
            this.checkAuth();
            this.getArticles();
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