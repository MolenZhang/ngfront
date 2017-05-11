# -*- rpm-spec -*-
BuildRoot:      /opt/gocode/src/ngfront/RPM/_CPack_Packages/RPM/ngfront-1.0-1.x86_64
Summary:        ngfront
Name:           ngfront
Version:        1.0
Release:        1
License:        unknown
Group:          unknown
Vendor:         unknown











%define _rpmdir /opt/gocode/src/ngfront/RPM/_CPack_Packages/RPM
%define _rpmfilename ngfront-1.0-1.x86_64.rpm
%define _unpackaged_files_terminate_build 0
%define _topdir /opt/gocode/src/ngfront/RPM/_CPack_Packages/RPM




%description
no package description available

# This is a shortcutted spec file generated by CMake RPM generator
# we skip _install step because CPack does that for us.
# We do only save CPack installed tree in _prepr
# and then restore it in build.
%prep
mv $RPM_BUILD_ROOT "/opt/gocode/src/ngfront/RPM/_CPack_Packages/RPM/tmpBBroot"

#p build

%install
if [ -e $RPM_BUILD_ROOT ];
then
  rm -rf $RPM_BUILD_ROOT
fi
mv "/opt/gocode/src/ngfront/RPM/_CPack_Packages/RPM/tmpBBroot" $RPM_BUILD_ROOT

%clean

%post


%postun


%pre


%preun


%files
%defattr(-,root,root,-)
%dir "/opt"
%dir "/opt/ngfront"
"/opt/ngfront/ngfront.cfg"
%dir "/opt/ngfront/template"
%dir "/opt/ngfront/template/css"
%dir "/opt/ngfront/template/css/core"
"/opt/ngfront/template/css/core/ambiance.css"
"/opt/ngfront/template/css/core/base.css"
"/opt/ngfront/template/css/core/dataTables.bootstrap.css"
"/opt/ngfront/template/css/core/jquery-ui.min.css"
%dir "/opt/ngfront/template/css/mod"
"/opt/ngfront/template/css/mod/awesome-bootstrap-checkbox.css"
"/opt/ngfront/template/css/mod/watcher.css"
"/opt/ngfront/template/css/mod/nginx.css"
%dir "/opt/ngfront/template/images"
"/opt/ngfront/template/images/dashboard-bg.jpg"
"/opt/ngfront/template/images/off_on.png"
"/opt/ngfront/template/images/running.gif"
"/opt/ngfront/template/images/server.svg"
"/opt/ngfront/template/images/stop.png"
"/opt/ngfront/template/images/warning.png"
%dir "/opt/ngfront/template/js"
%dir "/opt/ngfront/template/js/customer"
"/opt/ngfront/template/js/customer/custom.js"
"/opt/ngfront/template/js/customer/ipPort.js"
%dir "/opt/ngfront/template/js/nginx"
"/opt/ngfront/template/js/nginx/area.js"
"/opt/ngfront/template/js/nginx/nginxcfg1.js"
"/opt/ngfront/template/js/nginx/nginxcfg.js"
"/opt/ngfront/template/js/nginx/watcher.js"
"/opt/ngfront/template/js/nginx/clients.js"
%dir "/opt/ngfront/template/js/plugins"
"/opt/ngfront/template/js/plugins/codemirror.js"
"/opt/ngfront/template/js/plugins/dataTables.bootstrap.js"
"/opt/ngfront/template/js/plugins/echarts.common.min.js"
"/opt/ngfront/template/js/plugins/footable.all.min.js"
"/opt/ngfront/template/js/plugins/jquery-1.11.3.js"
"/opt/ngfront/template/js/plugins/jquery-1.11.3.min.js"
"/opt/ngfront/template/js/plugins/jquery-ui.min.js"
"/opt/ngfront/template/js/plugins/jquery.dataTables.js"
%dir "/opt/ngfront/template/plugins"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/bower.json"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/composer.json"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/dist"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css/bootstrap-theme.css"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css/bootstrap-theme.css.map"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css/bootstrap-theme.min.css"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css/bootstrap.css"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css/bootstrap.css.map"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/css/bootstrap.min.css"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/fonts"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/fonts/glyphicons-halflings-regular.eot"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/fonts/glyphicons-halflings-regular.svg"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/fonts/glyphicons-halflings-regular.ttf"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/fonts/glyphicons-halflings-regular.woff"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/fonts/glyphicons-halflings-regular.woff2"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/js/bootstrap.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/js/bootstrap.min.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/dist/js/npm.js"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/fonts"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/fonts/glyphicons-halflings-regular.eot"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/fonts/glyphicons-halflings-regular.svg"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/fonts/glyphicons-halflings-regular.ttf"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/fonts/glyphicons-halflings-regular.woff"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/fonts/glyphicons-halflings-regular.woff2"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/.jshintrc"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/bs-commonjs-generator.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/bs-glyphicons-data-generator.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/bs-lessdoc-parser.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/bs-raw-files-generator.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/configBridge.json"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/grunt/sauce_browsers.yml"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/Gruntfile.js"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/.jscsrc"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/.jshintrc"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/affix.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/alert.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/button.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/carousel.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/collapse.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/dropdown.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/modal.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/popover.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/scrollspy.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tab.js"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/index.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/README.md"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/.jshintrc"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/affix.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/alert.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/button.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/carousel.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/collapse.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/dropdown.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/modal.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/phantom.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/popover.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/scrollspy.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/tab.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/unit/tooltip.js"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/vendor"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/vendor/jquery.min.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/vendor/qunit.css"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/vendor/qunit.js"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/affix-with-sticky-footer.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/affix.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/alert.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/button.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/carousel.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/collapse.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/dropdown.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/modal.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/popover.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/scrollspy.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/tab.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tests/visual/tooltip.html"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/tooltip.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/js/transition.js"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/.csscomb.json"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/.csslintrc"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/alerts.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/badges.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/bootstrap.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/breadcrumbs.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/button-groups.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/buttons.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/carousel.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/close.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/code.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/component-animations.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/dropdowns.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/forms.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/glyphicons.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/grid.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/input-groups.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/jumbotron.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/labels.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/list-group.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/media.less"
%dir "/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/alerts.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/background-variant.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/border-radius.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/buttons.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/center-block.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/clearfix.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/forms.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/gradients.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/grid-framework.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/grid.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/hide-text.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/image.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/labels.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/list-group.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/nav-divider.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/nav-vertical-align.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/opacity.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/pagination.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/panels.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/progress-bar.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/reset-filter.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/reset-text.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/resize.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/responsive-visibility.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/size.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/tab-focus.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/table-row.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/text-emphasis.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/text-overflow.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins/vendor-prefixes.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/mixins.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/modals.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/navbar.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/navs.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/normalize.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/pager.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/pagination.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/panels.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/popovers.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/print.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/progress-bars.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/responsive-embed.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/responsive-utilities.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/scaffolding.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/tables.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/theme.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/thumbnails.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/tooltip.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/type.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/utilities.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/variables.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/less/wells.less"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/LICENSE"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/package.js"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/package.json"
"/opt/ngfront/template/plugins/bootstrap-3.3.5/_config.yml"
%dir "/opt/ngfront/template/plugins/Font-Awesome-master"
"/opt/ngfront/template/plugins/Font-Awesome-master/bower.json"
"/opt/ngfront/template/plugins/Font-Awesome-master/component.json"
"/opt/ngfront/template/plugins/Font-Awesome-master/composer.json"
"/opt/ngfront/template/plugins/Font-Awesome-master/CONTRIBUTING.md"
%dir "/opt/ngfront/template/plugins/Font-Awesome-master/css"
"/opt/ngfront/template/plugins/Font-Awesome-master/css/font-awesome.css"
"/opt/ngfront/template/plugins/Font-Awesome-master/css/font-awesome.css.map"
"/opt/ngfront/template/plugins/Font-Awesome-master/css/font-awesome.min.css"
%dir "/opt/ngfront/template/plugins/Font-Awesome-master/fonts"
"/opt/ngfront/template/plugins/Font-Awesome-master/fonts/fontawesome-webfont.eot"
"/opt/ngfront/template/plugins/Font-Awesome-master/fonts/fontawesome-webfont.svg"
"/opt/ngfront/template/plugins/Font-Awesome-master/fonts/fontawesome-webfont.ttf"
"/opt/ngfront/template/plugins/Font-Awesome-master/fonts/fontawesome-webfont.woff"
"/opt/ngfront/template/plugins/Font-Awesome-master/fonts/fontawesome-webfont.woff2"
"/opt/ngfront/template/plugins/Font-Awesome-master/fonts/FontAwesome.otf"
%dir "/opt/ngfront/template/plugins/Font-Awesome-master/less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/animated.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/bordered-pulled.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/core.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/fixed-width.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/font-awesome.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/icons.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/larger.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/list.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/mixins.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/path.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/rotated-flipped.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/stacked.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/less/variables.less"
"/opt/ngfront/template/plugins/Font-Awesome-master/package.json"
%dir "/opt/ngfront/template/plugins/Font-Awesome-master/scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/font-awesome.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_animated.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_bordered-pulled.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_core.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_fixed-width.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_icons.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_larger.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_list.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_mixins.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_path.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_rotated-flipped.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_stacked.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/scss/_variables.scss"
"/opt/ngfront/template/plugins/Font-Awesome-master/_config.yml"
%dir "/opt/ngfront/template/plugins/layer"
"/opt/ngfront/template/plugins/layer/demo.html"
%dir "/opt/ngfront/template/plugins/layer/extend"
"/opt/ngfront/template/plugins/layer/extend/layer.ext.js"
"/opt/ngfront/template/plugins/layer/layer.js"
%dir "/opt/ngfront/template/plugins/layer/skin"
%dir "/opt/ngfront/template/plugins/layer/skin/default"
"/opt/ngfront/template/plugins/layer/skin/default/icon-ext.png"
"/opt/ngfront/template/plugins/layer/skin/default/icon.png"
"/opt/ngfront/template/plugins/layer/skin/default/loading-0.gif"
"/opt/ngfront/template/plugins/layer/skin/default/loading-1.gif"
"/opt/ngfront/template/plugins/layer/skin/default/loading-2.gif"
"/opt/ngfront/template/plugins/layer/skin/layer.css"
"/opt/ngfront/template/plugins/layer/skin/layer.ext.css"
%dir "/opt/ngfront/template/plugins/nicescroll"
"/opt/ngfront/template/plugins/nicescroll/jquery.nicescroll.js"
"/opt/ngfront/template/plugins/nicescroll/jquery.nicescroll.min.js"
"/opt/ngfront/template/plugins/nicescroll/zoomico.png"
%dir "/opt/ngfront/template/views"
%dir "/opt/ngfront/template/views/nginx"
"/opt/ngfront/template/views/nginx/area.html"
"/opt/ngfront/template/views/nginx/nginxcfg.html"
"/opt/ngfront/template/views/nginx/watcher.html"
"/opt/ngfront/template/views/nginx/clients.html"
%dir "/usr/local"
%dir "/usr/local/bin"
"/usr/local/bin/ngfront"
%dir "/usr/lib/systemd"
%dir "/usr/lib/systemd/system"
"/usr/lib/systemd/system/ngfront.service"




%changelog
* Sun Jul 4 2010 Eric Noulard <eric.noulard@gmail.com> - 1.0-1
  Generated by CPack RPM (no Changelog file were provided)