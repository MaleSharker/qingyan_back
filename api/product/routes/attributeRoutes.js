/**
 * Created by baichenchen on 2017/7/16.
 */

module.exports = (app) => {
    let attributeController = require('../controllers/attributeController');

    /**
     * 添加属性
     */
    app.route('/mgmt/v1/product/createAttribute')
        .post(attributeController.postCreateAttribute);

    /**
     * 更新属性
     */
    app.route('/mgmt/v1/product/updateAttribute')
        .post(attributeController.postUpdateAttribute);

    /**
     * 删除属性
     */
    app.route('/mgmt/v1/product/deleteAttribute')
        .post(attributeController.postDeleteAttribute);

    /**
     * 添加属性选项
     */
    app.route('/mgmt/v1/product/createAttriChoices')
        .post(attributeController.postCreateAttriChoices);

    /**
     * 删除属性选项
     */
    app.route('/mgmt/v1/product/deleteAttriChoice')
        .post(attributeController.postDeleteAttriChoice);

    /**
     * 添加属性关联
     */
    app.route('/mgmt/v1/product/createAttriRelation')
        .post(attributeController.postCreateAttriRelation);

    /**
     * 删除属性选项关联
     */
    app.route('/mgmt/v1/product/deleteAttriRelation')
        .post(attributeController.postDeleteAttriRelation);

};
