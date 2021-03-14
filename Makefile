update-frontend:
	pushd frontend && npm run build && aws s3 cp --recursive --acl public-read frontend/build/ s3://poc.serverlogger.com/ && popd
