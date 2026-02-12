#!/usr/bin/env bash

set -euo pipefail

# hostlist='bh4tdv.nrlptt.com'
hostlist='182.92.158.141 nrlptt.com ba1gm.nrlptt.com nrlptt.bd4vki.xyz bd4vki.nrlptt.com ah.nrlptt.com nrl.bd4two.site ptt.nrlptt.com bh1osw.nrlptt.com yz.hamoa.cn ham.73ham.com bd4two.nrlptt.com js.nrlptt.com bg1vif.nrlptt.com usa.nrlptt.com yz.hamuv.com'

# 调试单机时可覆盖：
#hostlist='js.nrlptt.com'
#hostlist="ptt.nrlptt.com"
#hostlist='nrl.bd4two.site'

#hostlist='bh1osw.nrlptt.com'
#hostlist='nrlptt.bd4vki.xyz'
#hostlist='nrlptt.com'
#hostlist='bd4vki.nrlptt.com'
#hostlist='yz.hamuv.com'

hostlist="182.92.158.141"

timestamp="$(date '+%Y%m%d%H%M%S')"
release_name="www.${timestamp}"
dist_pkg="/tmp/nrllink-dist.${timestamp}.tar.gz"

# 可选：打包并同步当前工程到内网机
sync_repo_host="192.168.35.40"
sync_repo_target="/root/nrllink/nrllink/www"

# 可选：yarn lint --fix
# 可选：yarn build:prod

if [ ! -d dist ]; then
  echo "dist 目录不存在，请先执行构建（例如 yarn build:prod）"
  exit 1
fi

cleanup() {
  rm -f "${dist_pkg}"
}
trap cleanup EXIT

echo "packing dist once: ${dist_pkg} ..."
tar -C dist -czf "${dist_pkg}" .

echo "syncing project to ${sync_repo_host} ..."
tar --exclude=.git --exclude=node_modules --exclude=dist -czf - . \
  | ssh "root@${sync_repo_host}" "rm -rf '${sync_repo_target}' && mkdir -p '${sync_repo_target}' && tar -xzf - -C '${sync_repo_target}'"

for host in $hostlist; do
  echo "deploying to ${host} ..."

  remote_pkg="/tmp/$(basename "${dist_pkg}")"
  scp "${dist_pkg}" "root@${host}:${remote_pkg}"
  ssh "root@${host}" "mkdir -p '/nrllink/${release_name}' && tar -xzf '${remote_pkg}' -C '/nrllink/${release_name}' && rm -f '${remote_pkg}'"

  # 原子切换：先备份旧目录，再把新版本切成 www
  ssh "root@${host}" "
    set -e
    cd /nrllink
    if [ -d www ]; then mv www 'www.bak.${timestamp}'; fi
    mv '${release_name}' www
  "
done

echo "deploy finished."
