import axios from "axios";

axios.defaults.baseURL = 'http://app.dev/api';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem('access_token');
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//获取用户信息
export const getUserInfo = params => {
    return axios.get(`/userinfo`, {params: params});
};
//获取用户权限
export const getUserAuth = params => {
    return axios.get(`/userauth`, {params: params});
};
export const requestLogin = params => {
    return axios.post(`/user/login`, params).then(res => res.data);
};
export const getUserList = params => {
    return axios.get(`/user/list`, {params: params});
};
//用户管理
export const getUserListPage = params => {
    return axios.get(`/user`, {params: params});
};
//用户管理
export const removeUser = params => {
    return axios.get(`/user/remove`, {params: params});
};
export const batchRemoveUser = params => {
    return axios.get(`/user/batchremove`, {params: params});
};
export const addUser = params => {
    return axios.post(`/user/store`, params);
};
export const editUser = params => {
    return axios.post(`/user/update`, params);
};
export const checkNameApi = params => {
    return axios.get(`/checkusername`, {params: params});
};
export const checkEmailApi = params => {
    return axios.get(`/checkuseremail`, {params: params});
};


//分类管理
export const getCategoryListPage = params => {
    return axios.get(`/category`, {params: params});
};
export const getCategoryList = params => {
    return axios.get(`/categorylist`, {params: params});
};
export const removeCategory = params => {
    return axios.get(`/category/remove`, {params: params});
};
export const batchRemoveCategory = params => {
    return axios.get(`/category/batchremove`, {params: params});
};
export const addCategory = params => {
    return axios.post(`/category/store`, params);
};
export const editCategory = params => {
    return axios.post(`/category/update`, params);
};
export const checkCateNameApi = params => {
    return axios.get(`/checkcatename`, {params: params});
};


//标签管理
export const getTagListPage = params => {
    return axios.get(`/tag`, {params: params});
};
export const getTagList = params => {
    return axios.get(`/taglist`, {params: params});
};
export const removeTag = params => {
    return axios.get(`/tag/remove`, {params: params});
};
export const batchRemoveTag = params => {
    return axios.get(`/tag/batchremove`, {params: params});
};
export const addTag = params => {
    return axios.post(`/tag/store`, params);
};
export const editTag = params => {
    return axios.post(`/tag/update`, params);
};
export const checkTagNameApi = params => {
    return axios.get(`/checktagname`, {params: params});
};

//链接管理
export const getLinkListPage = params => {
    return axios.get(`/link`, {params: params});
};
export const removeLink = params => {
    return axios.get(`/link/remove`, {params: params});
};
export const batchRemoveLink = params => {
    return axios.get(`/link/batchremove`, {params: params});
};
export const addLink = params => {
    return axios.post(`/link/store`, params);
};
export const editLink = params => {
    return axios.post(`/link/update`, params);
};
export const checkLinkNameApi = params => {
    return axios.get(`/checklinkname`, {params: params});
};

//文章管理
export const getArticleListPage = params => {
    return axios.get(`/article`, {params: params});
};
export const getTopArticle = params => {
    return axios.get(`/article`, {params: params});
};
export const removeArticle = params => {
    return axios.get(`/article/remove`, {params: params});
};
export const batchRemoveArticle = params => {
    return axios.get(`/article/batchremove`, {params: params});
};
export const addArticle = params => {
    return axios.post(`/article/store`, params);
};
export const editArticle = params => {
    return axios.post(`/article/update`, params);
};
export const checkArticleNameApi = params => {
    return axios.get(`/checkarticlename`, {params: params});
};


//角色管理
export const getRoleListPage = params => {
    return axios.get(`/role`, {params: params});
};
export const getAllPermissions = params => {
    return axios.get(`/getallpermissions`, {params: params});
};
export const removeRole = params => {
    return axios.get(`/role/remove`, {params: params});
};
export const batchRemoveRole = params => {
    return axios.get(`/role/batchremove`, {params: params});
};
export const addRole = params => {
    return axios.post(`/role/store`, params);
};
export const editRole = params => {
    return axios.post(`/role/update`, params);
};
export const checkRoleNameApi = params => {
    return axios.get(`/checkrolename`, {params: params});
};

//权限管理
export const getPermissionListPage = params => {
    return axios.get(`/permission`, {params: params});
};
export const removePermission = params => {
    return axios.get(`/permission/remove`, {params: params});
};
export const batchRemovePermission = params => {
    return axios.get(`/permission/batchremove`, {params: params});
};
export const addPermission = params => {
    return axios.post(`/permission/store`, params);
};
export const editPermission = params => {
    return axios.post(`/permission/update`, params);
};
export const checkPermissionNameApi = params => {
    return axios.get(`/checkpermissionname`, {params: params});
};


//日志管理
export const getLogListPage = params => {
    return axios.get(`/log`, {params: params});
};
export const removeLog = params => {
    return axios.get(`/log/remove`, {params: params});
};
export const batchRemoveLog = params => {
    return axios.get(`/log/batchremove`, {params: params});
};
//评论管理
export const getCommentListPage = params => {
    return axios.get(`/comment`, {params: params});
};
export const removeComment = params => {
    return axios.get(`/comment/remove`, {params: params});
};
export const batchRemoveComment = params => {
    return axios.get(`/comment/batchremove`, {params: params});
};

export const errors = rs => {
    if (rs.response.status == '500') {
        return {message: '服务器错误', type: 'error', duration: '3000'};
    } else if (rs.response.status == '422') {
        let msg =''
        for(let v in rs.response.data){
           msg += v+':'+rs.response.data[v].join()
        }
        return {message: '验证数据失败!!' + msg, type: 'error', duration: '3000'};
    } else if (rs.response.status == '403') {
        return {message: '没有权限', type: 'error', duration: '3000'};
    } else {
        return {message: rs.response.status, type: 'error', duration: '3000'};
    }
};
