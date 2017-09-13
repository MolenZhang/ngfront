SET(CPACK_GENERATOR "RPM")
SET(CPACK_PACKAGE_NAME "ngfront")
SET(CPACK_PACKAGE_VERSION "1.0")
SET(CPACK_PACKAGE_RELEASE "1")
SET(CPACK_PACKAGE_DESCRIPTION "ngfront which will be installed in /opt/")
SET(CPACK_PACKAGE_FILE_NAME
	"${CPACK_PACKAGE_NAME}-${CPACK_PACKAGE_VERSION}-${CPACK_PACKAGE_RELEASE}.${CMAKE_SYSTEM_PROCESSOR}")
SET(CPACK_INSTALL_COMMANDS
	"mkdir -p $ENV{PWD}/build/"
	"mkdir -p $ENV{PWD}/build/opt/ngfront/"
	"mkdir -p $ENV{PWD}/build/usr/local/bin/"
	"mkdir -p $ENV{PWD}/build/usr/lib/systemd/system/"
	"cp $ENV{PWD}/ngfront.cfg /$ENV{PWD}/build/opt/ngfront/"
	"cp $ENV{PWD}/ngfront /$ENV{PWD}/build/usr/local/bin/"
	"cp $ENV{PWD}/ngfront.service /$ENV{PWD}/build/usr/lib/systemd/system/"
	"cp $ENV{PWD}/template /$ENV{PWD}/build/opt/ngfront/ -rf"
	)
SET(CPACK_INSTALLED_DIRECTORIES
	"$ENV{PWD}/build;/")
