const dbConfig = {
    mariadb: {
        account: "root",
        tool: "phpMyAdmin,CloudBeaver",
    },
    mysql: {
        account: "root",
        tool: "phpMyAdmin,CloudBeaver",
    },
    postgresql: {
        account: "postgres",
        tool: "pgAdmin,CloudBeaver",
    },
    mongodb: {
        account: "root",
        tool: "MongoCompass",
    },
    oracle: {
        account: "system",
        tool: "CloudBeaver",
    },
    sqlserver: {
        account: "sa",
        tool: "CloudBeaver",
    },
    redis: {
        account: "",
        tool: "RedisInsight",
    }
};

export default dbConfig;
