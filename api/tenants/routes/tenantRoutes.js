/**
 * Created by cc on 17/7/4.
 */

const path = require('path');
const tenantController = require('../controllers/tenantManageController');


module.exports = function tenantRoutes(app) {

    /**
     * 创建店铺
     */
    app.route('/mgmt/v1/tenant/createTenant')
        .post(tenantController.postCreateTenant);

};

