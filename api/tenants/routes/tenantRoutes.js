/**
 * Created by cc on 17/7/4.
 */

const path = require('path');
const tenantController = require('../controllers/tenantManageController');
// const multipart = require('connect-multiparty');
// const multer = require('multer');
// const upload = multer({dest: 'uploads/'});

module.exports = function tenantRoutes(app) {

    /**
     * 创建店铺
     */
    app.route('/mgmt/v1/tenant/createTenant')
        .post(tenantController.postCreateTenant);


    /**
     * 修改店铺状态
     */
    app.route('/mgmt/v1/tenant/updateTenantStatus')
        .post(tenantController.postUpdateTenantStatus);


    /**
     * 修改店铺信息
     */
    app.route('/mgmt/v1/tenant/updateTenantDesc')
        .post(tenantController.postUpdateTenantDesc);

    /**
     * 用户更新商铺图片
     */
    app.route('/mgmt/v1/tenant/uploadTenantImage')
        .post(tenantController.postUploadTenantImage);
    // app.post('/mgmt/v1/tenant/uploadTenantImage', upload.single('imageFile'), (req, res, next) => {
    //
    // });
};

