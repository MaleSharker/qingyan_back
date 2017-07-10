/**
 * Created by cc on 17/7/4.
 */

const path = require('path');
const tenantController = require('../controllers/tenantManageController');
const brandController = require('../controllers/brandManageController');

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

    /**
     * 店铺创建商品品牌
     */
    app.route('/mgmt/v1/tenant/tenantCreateBrand')
        .post(brandController.postTenantCreateBrand);


};

