#!/bin/bash
ls

HOSTIP=$1
#在maxthreads模式下需要指定线程个数
PORT=$2

if [ $# = 0 ];then
        echo "使用默认IP+Port运行"
#	./ngfront
fi

if [ $# != 2 ];then
        echo "参数个数不正确 退出"
        exit
fi

sed -i 's/var areaIP = "'${HOSTIP}'";/var areaIP = "localhost";/g' template/js/nginx/area.js
sed -i 's/var areaIP = "'${HOSTIP}'";/var areaIP = "localhost";/g' template/js/nginx/clients.js
sed -i 's/var areaIP = "'${HOSTIP}'";/var areaIP = "localhost";/g' template/js/nginx/k8snginxcfg.js
sed -i 's/var areaIP = "'${HOSTIP}'";/var areaIP = "localhost";/g' template/js/nginx/watcher.js
sed -i 's/var areaPort = "'${PORT}'";/var areaPort = "port";/g' template/js/nginx/area.js
sed -i 's/var areaPort = "'${PORT}'";/var areaPort = "port";/g' template/js/nginx/clients.js
sed -i 's/var areaPort = "'${PORT}'";/var areaPort = "port";/g' template/js/nginx/k8snginxcfg.js
sed -i 's/var areaPort = "'${PORT}'";/var areaPort = "port";/g' template/js/nginx/watcher.js

echo "还原完成!"
