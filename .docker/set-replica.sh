#!/bin/bash

# 운영 환경에서는 반드시 아래 비밀번호를 변경하세요
user='root'
password='1234'

mysql_master='mysql-master'
mysql_slave='mysql-slave'

repl_user='replica'
repl_pwd='1234'

master_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${mysql_master})
slave_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${mysql_slave})

ignore="Warning"

echo "#######################################################################"
echo "# Replica setting to MASTER (${master_ip})....                        #"
echo "#######################################################################"

command="CREATE USER '${repl_user}'@'%' IDENTIFIED BY '${repl_pwd}';"
echo "master> ${command}"
docker exec -it ${mysql_master} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="GRANT REPLICATION SLAVE,REPLICATION CLIENT ON *.* TO '${repl_user}'@'%';"
echo "master> ${command}"
docker exec -it ${mysql_master} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="FLUSH PRIVILEGES;"
echo "master> ${command}"
docker exec -it ${mysql_master} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="RESET BINARY LOGS AND GTIDS;"
echo "master> ${command}"
docker exec -it ${mysql_master} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

echo "#######################################################################"
echo "# Replica setting to SLAVE (${slave_ip})....                          #"
echo "#######################################################################"

command="STOP REPLICA;"
echo "slave> ${command}"
docker exec -it ${mysql_slave} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="RESET REPLICA;"
echo "slave> ${command}"
docker exec -it ${mysql_slave} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="CHANGE REPLICATION SOURCE TO SOURCE_HOST='${master_ip}', SOURCE_USER='${repl_user}', SOURCE_PASSWORD='${repl_pwd}', SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1;"
echo "slave> ${command}"
docker exec -it ${mysql_slave} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="SET GTID_NEXT=\"AUTOMATIC\""
echo "slave> ${command}"
docker exec -it ${mysql_slave} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="START REPLICA;"
echo "slave> ${command}"
docker exec -it ${mysql_slave} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"

command="SET GLOBAL super_read_only = 1"
echo "slave> ${command}"
docker exec -it ${mysql_slave} mysql -u${user} -p${password} -e "${command}" | grep -v "${ignore}"
