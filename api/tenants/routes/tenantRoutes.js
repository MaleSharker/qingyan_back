/**
 * Created by cc on 17/7/4.
 */

const path = require('path');
const tenantController = require('../controllers/tenantController');
var brandController = require('../controllers/brandController');

module.exports = function tenantRoutes(app) {

    /**
     * 创建店铺
     */
    app.route('/mgmt/v1/tenant/createTenant')
        .post(tenantController.postCreateTenant);

    /**
     * 查询店铺信息
     */
    app.route('/mgmt/v1/tenant/findTenant')
        .post(tenantController.postFindTenant);

    /**
     * 修改店铺信息
     */
    app.route('/mgmt/v1/tenant/updateTenant')
        .post(tenantController.postUpdateTenant);

    /**
     * 用户更新商铺图片
     */
    app.route('/mgmt/v1/tenant/uploadTenantImage')
        .post(tenantController.postUploadTenantImage);

    //* * * * * 商品品牌相关 * * * * * //
    /**
     * 创建商品品牌
     */
    app.route('/mgmt/v1/tenant/createBrand')
        .post(brandController.postCreateBrand);

    /**
     * 更新品牌信息
     */
    app.route('/mgmt/v1/tenant/updateBrand')
        .post(brandController.postUpdateBrand);

    /**
     * 查询商铺所有品牌
     */
    app.route('/mgmt/v1/tenant/findAllBrand')
        .post(brandController.postFindAllBrand);

    /**
     * 上传品牌图片
     */
    app.route('/mgmt/v1/tenant/uploadBrandImg')
        .post(brandController.postUploadBrandImg);

};

