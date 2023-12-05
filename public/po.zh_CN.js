(function (root, data) {
    var loaded, module;

    /* Load into AMD if desired */
    if (typeof define === 'function' && define.amd) {
        define(data);
        loaded = true;
    }

    /* Load into Cockpit locale */
    if (typeof cockpit === 'object') {
        cockpit.locale(data)
        loaded = true;
    }

    if (!loaded)
        root.po = data;

    /* The syntax of this line is important  by po2json */
}(this, {
    "": {
        'plural-forms': function (n) {
            var nplurals, plural;
            nplurals = 1; plural = 0;
            return plural;
        },
        "language": "zh_CN",
        "x-generator": "Weblate 3.10.3"
    },
    "$0 day": [
        "$0 days",
        "$0 天"
    ],
    "$0 hour": [
        "$0 hours",
        "$0 小时"
    ],
    "$0 minute": [
        "$0 minutes",
        "$0 分钟"
    ],
    "$0 month": [
        "$0 months",
        "$0 月"
    ],
    "$0 week": [
        "$0 weeks",
        "$0 周"
    ],
    "$0 year": [
        "$0 years",
        "$0 年"
    ],
    "1 day": [
        null,
        "1 天"
    ],
    "1 hour": [
        null,
        "1 小时"
    ],
    "1 week": [
        null,
        "1 周"
    ],
    "5 minutes": [
        null,
        "5 分钟"
    ],
    "App Store": [
        null,
        "应用商店"
    ],
    "My Apps": [
        null,
        "我的应用"
    ],
    "All": [
        null,
        "全部"
    ],
    "developers": [
        null,
        "文档"
    ],
    "Version": [
        null,
        "版本"
    ],
    "Requires at least": [
        null,
        "最低配置要求"
    ],
    "Name": [
        null,
        "名称"
    ],
    "Close": [
        null,
        "关闭"
    ],
    "Install": [
        null,
        "安装"
    ],
    "Other Apps": [
        null,
        "其他应用"
    ],
    "Websoft9's Apps": [
        null,
        "微聚云应用"
    ],
    "Refresh": [
        null,
        "刷新"
    ],
    "All States": [
        null,
        "所有状态"
    ],
    "Domain": [
        null,
        "域名"
    ],
    "Access": [
        null,
        "访问"
    ],
    "access": [
        null,
        "访问"
    ],
    "Backups": [
        null,
        "备份"
    ],
    "Uninstall": [
        null,
        "卸载"
    ],
    "Updates": [
        null,
        "更新"
    ],
    "Please enter a custom application name between 2 and 20 characters.": [
        null,
        "请输入一个2-20位的自定义应用名称."
    ],
    "Only letters and numbers from 2 to 20 are allowed. No special characters.": [
        null,
        "只允许使用2-20位的字母和数字,不允许使用特殊字符."
    ],
    "Start App": [
        null,
        "启动应用"
    ],
    "Stop App": [
        null,
        "停止应用"
    ],
    "Start": [
        null,
        "启动"
    ],
    "Stop": [
        null,
        "停止"
    ],
    "Restart App": [
        null,
        "重启应用"
    ],
    "Documentation": [
        null,
        "文档"
    ],
    "This will immediately uninstall the app, If the data is preserved, the app can be redeploy.": [
        null,
        "这将马上卸载应用，如果保留数据，应用可以重新部署。"
    ],
    "Start / Stop": [
        null,
        "启动 / 停止"
    ],
    "This will uninstall the app immediately.The app will be inaccessible.": [
        null,
        "这将立即卸载应用程序,该应用程序将无法访问."
    ],
    "Apps can be stopped to conserve server resources instead of uninstalling.": [
        null,
        "可以停止应用程序以节省服务器资源,而不是卸载."
    ],
    "This is the error message for": [
        null,
        "错误消息:"
    ],
    "Code: ": [
        null,
        "错误代码:"
    ],
    "Message: ": [
        null,
        "错误消息:"
    ],
    "Detail: ": [
        null,
        "错误详情:"
    ],
    "Support": [
        null,
        "支持"
    ],
    "Remove": [
        null,
        "删除"
    ],
    "This will immediately remove the app and remove all its data.": [
        null,
        "这将立马删除应用，并将删除所有数据。"
    ],
    "Domain Binding": [
        null,
        "域名绑定"
    ],
    "Add": [
        null,
        "添加"
    ],
    "More": [
        null,
        "更多"
    ],
    "more": [
        null,
        "更多"
    ],
    "save": [
        null,
        "保存"
    ],
    "cancel": [
        null,
        "取消"
    ],
    "edit": [
        null,
        "编辑"
    ],
    "Compose": [
        null,
        "编排"
    ],
    "delete": [
        null,
        "删除"
    ],
    "Delete": [
        null,
        "删除"
    ],
    "default": [
        null,
        "默认"
    ],
    "set as default": [
        null,
        "设为默认"
    ],
    "Domain name cannot be empty": [
        null,
        "域名不能为空"
    ],
    "Please enter the correct domain name and cannot start with http or https!": [
        null,
        "请输入正确的域名,并且不能以http或者https开始！"
    ],
    "Are you sure you want to delete the domain for:": [
        null,
        "你确定删除绑定的域名："
    ],
    "Are you sure you want to update the domain for:": [
        null,
        "你确定修改绑定的域名："
    ],
    "Success": [
        null,
        "执行成功"
    ],
    "Update": [
        null,
        "更新"
    ],
    "Delete domain binding": [
        null,
        "删除绑定域名"
    ],
    "Update domain binding": [
        null,
        "修改绑定域名"
    ],
    "saving...": [
        null,
        "保存中..."
    ],
    "Portainer": [
        null,
        "容器"
    ],
    "Container": [
        null,
        "容器"
    ],
    "Nginx": [
        null,
        "域名"
    ],
    "BackUp": [
        null,
        "备份"
    ],
    "Navigator": [
        null,
        "文件"
    ],
    "Search for apps like WordPress, MySQL, GitLab, …": [
        null,
        "请输入要搜索的应用名称,例如:WordPress,MySQL,GitLab, …"
    ],
    "App Overview": [
        null,
        "应用概览"
    ],
    "App Name": [
        null,
        "应用名称"
    ],
    "App Version": [
        null,
        "应用版本"
    ],
    "App Port": [
        null,
        "应用端口"
    ],
    "Created Time": [
        null,
        "创建时间"
    ],
    "App Config": [
        null,
        "应用配置"
    ],
    "Domain Access": [
        null,
        "域名访问"
    ],
    "Access the domain name for better application performance, https and custom configuration can click": [
        null,
        "域名访问以获得更好的应用程序性能,HTTPS和自定义配置可点击"
    ],
    "Add Domain": [
        null,
        "添加域名"
    ],
    "Add": [
        null,
        "添加"
    ],
    "Admin Page": [
        null,
        "访问后台"
    ],
    "Add domain binding": [
        null,
        "添加域名绑定"
    ],
    "This application consists of the following containers, and the one named $0 is the main container.": [
        null,
        "本应用由如下容器组成，名称为 $0 的为主容器"
    ],
    "Are you sure you want to add the domain for:": [
        null,
        "你确定绑定域名："
    ],
    "No Apps Found": [
        null,
        "没有检索到相关应用"
    ],
    "Actions": [
        null,
        "操作"
    ],
    "Image": [
        null,
        "镜像"
    ],
    "Created": [
        null,
        "创建时间"
    ],
    "Ip Address": [
        null,
        "IP地址"
    ],
    "Published Ports": [
        null,
        "公共端口"
    ],
    "No Domain Access": [
        null,
        "无域名访问"
    ],
    "No domain name can temporarily access the application by IP + port": [
        null,
        "没有域名可以通过IP+端口的方式临时访问应用"
    ],
    "Frontend": [
        null,
        "前台"
    ],
    "Backend": [
        null,
        "后台"
    ],
    "Initial Account": [
        null,
        "初始账号"
    ],
    "UserName": [
        null,
        "账号"
    ],
    "Password": [
        null,
        "密码"
    ],
    "This application is pre-configured with an administrator account, please change the administrator password immediately. The initial credentials are:": [
        null,
        "此应用程序是使用管理员帐户预先设置的，请立即更改管理员密码。初始凭据为："
    ],
    "Overview": [
        null,
        "概览"
    ],
    "No apps installed yet!": [
        null,
        "尚未安装任何应用程序！"
    ],
    "How about installing some? Check out the ": [
        null,
        "安装应用请转到 "
    ],
    "Redeploy": [
        null,
        "重建"
    ],
    "Redeploy App": [
        null,
        "重建应用"
    ],
    "Gitea": [
        null,
        "仓库"
    ],
    "This will be applied through local warehouse reconstruction. If the warehouse does not exist or there are errors in the warehouse file, the reconstruction will fail.": [
        null,
        "这将通过本地仓库重建应用，如果仓库不存在或者仓库文件错误则会重建失败。"
    ],
    "Do you want to purge the data:": [
        null,
        "是否清除数据："
    ],
    "Restart Success": [
        null,
        "应用重启成功"
    ],
    "Start Success": [
        null,
        "应用启动成功"
    ],
    "Stop Success": [
        null,
        "应用停止成功"
    ],
    "Re-pull image and redeploy:": [
        null,
        "重新提取镜像并重新部署："
    ],
    "Password copied successfully": [
        null,
        "密码复制成功"
    ],
    "Password copied failed": [
        null,
        "密码复制失败"
    ],
    "Successfully deleted": [
        null,
        "删除成功"
    ],
    "Saved successfully": [
        null,
        "保存成功"
    ],
    "Domain name cannot be empty": [
        null,
        "域名不能为空"
    ],
    "View Config": [
        null,
        "查看配置"
    ],
    "Volumes": [
        null,
        "卷存"
    ],
    "Driver": [
        null,
        "驱动"
    ],
    "Mount point": [
        null,
        "挂载点"
    ],
    "Rebuild the application after orchestrating it on-demand. Suitable for users familiar with Docker.": [
        null,
        "对应用进行按需编排后重建应用，适用熟悉Docker的用户操作"
    ],
    "Modify the Git repository for this application.": [
        null,
        "修改当前应用的Git仓库"
    ],
    "Websoft9's applications adopt the popular GitOps pattern in cloud-native architecture, where the orchestration source code of the application is codified and stored in a Git repository.": [
        null,
        "Websoft9的应用采用云原生架构中流行的GitOps模式，将应用的编排源码化并存储在Git仓库中。"
    ],
    "Prompt Adjustment": [
        null,
        "马上修改"
    ],
    "Back": [
        null,
        "返回"
    ],
    "Rebuild the application after orchestrating it on-demand.": [
        null,
        "按需编排应用程序后重新生成应用程序。"
    ],
    "Host": [
        null,
        "主机"
    ],
    "Port": [
        null,
        "端口"
    ],
    "App Id": [
        null,
        "应用Id"
    ],
    "W9_HTTP_PORT_SET": [
        null,
        "应用 HTTP 端口"
    ],
    "W9_DB_PORT_SET": [
        null,
        "应用数据库端口"
    ]
}));,
    "W9_AGENT_PORT_SET": [
        null,
        "应用代理端口"
    ],
    "W9_SSH_PORT_SET": [
        null,
        "应用 SSH 端口"
    ],
    "W9_EM_PORT_SET": [
        null,
        ""
    ],
    "W9_SYSLOG_TCP_PORT_SET": [
        null,
        ""
    ],
    "W9_SYSLOG_UDP_PORT_SET": [
        null,
        ""
    ],
    "W9_GELE_TCP_PORT_SET": [
        null,
        ""
    ],
    "W9_GELE_UDP_PORT_SET": [
        null,
        ""
    ],
    "W9_TCP_PORT_SET": [
        null,
        ""
    ],
    "W9_TRANSFORM_PORT_SET": [
        null,
        ""
    ],
    "W9_SOLR_PORT_SET": [
        null,
        ""
    ],
    "W9_AMQP_PORT_SET": [
        null,
        ""
    ],
    "W9_OPENWIRE_PORT_SET": [
        null,
        ""
    ],
    "W9_STOMP_PORT_SET": [
        null,
        ""
    ],
    "W9_HTTPS_PORT_SET": [
        null,
        ""
    ],
    "W9_DB_INFLUXDB_PORT_SET": [
        null,
        ""
    ],
    "W9_DB_INFLUXDB_GRAPHITE_PORT_SET": [
        null,
        ""
    ],
    "W9_API_PORT_SET": [
        null,
        ""
    ],
    "W9_DB_KAFKA_PORT_SET": [
        null,
        ""
    ],
    "W9_ZOOMKEEPER_PORT_SET": [
        null,
        ""
    ],
    "W9_STATS_PORT_SET": [
        null,
        ""
    ],
    "W9_MEM_PORT_SET": [
        null,
        ""
    ],
    "W9_PANEL_PORT_SET": [
        null,
        ""
    ],
    "W9_MAGE_PORT_SET": [
        null,
        ""
    ],
    "W9_DASH_PORT_SET": [
        null,
        ""
    ],
    "W9_GUI_PORT_SET": [
        null,
        ""
    ],
    "W9_SET_PORT_SET": [
        null,
        ""
    ],
    "W9_MQ_PORT_SET": [
        null,
        ""
    ],
    "W9_ER_PORT_SET": [
        null,
        ""
    ],
    "W9_AUTH_PORT_SET": [
        null,
        ""
    ],
    "W9_WEBSOCKET_PORT_SET": [
        null,
        ""
    ],
    "W9_ES_PORT_SET": [
        null,
        ""
    ],
    "W9_GRPC_PORT_SET": [
        null,
        ""
    ],
    "W9_PORT_1_SET": [
        null,
        ""
    ],
    "W9_PORT_2_SET": [
        null,
        ""
    ],
    "W9_PORT_3_SET": [
        null,
        ""
    ],
    "W9_WEB_PORT_SET": [
        null,
        ""
    ],
    "W9_DASHBOARD_PORT_SET": [
        null,
        ""
    ],
    "W9_DB_POSTGRES_PORT_SET": [
        null,
        ""
    ],
    "W9_CLIENT_PORT_SET": [
        null,
        ""
    ],
    "W9_CLUSTER_PORT_SET": [
        null,
        ""
    ],
    "W9_ZERO_1_PORT_SET": [
        null,
        ""
    ],
    "W9_ZERO_2_PORT_SET": [
        null,
        ""
    ],
    "W9_ALPHA_1_PORT_SET": [
        null,
        ""
    ],
    "W9_ALPHA_2_PORT_SET": [
        null,
        ""
    ],
    "W9_RATEL_PORT_SET": [
        null,
        ""
    ],
    "W9_KIBANA_PORT_SET": [
        null,
        ""
    ],
    "W9_DB_ES_HTTP_PORT_SET": [
        null,
        ""
    ],
    "W9_DB_ES_TCP_PORT_SET": [
        null,
        ""
    ],
    "W9_LOGSTASH_BEATS_PORT_SET": [
        null,
        ""
    ],
    "W9_LOGSTASH_TCP_PORT_SET": [
        null,
        ""
    ],
    "W9_LOGSTASH_UDP_PORT_SET": [
        null,
        ""
    ],
    "W9_LOGSTASH_API_PORT_SET": [
        null,
        ""
    ],
    "W9_MQTT_PORT_SET": [
        null,
        ""
    ],
    "W9_RPC_PORT_SET": [
        null,
        ""
    ],
    "W9_UDP_PORT_SET": [
        null,
        ""
    ],
    "W9_KAFKA_PORT_SET": [
        null,
        ""
    ],
    "W9_ZK_PORT_SET": [
        null,
        ""
    ]

