# grails3-angular-duo

Simple but effective grails 3 & angular combination that can be used as a template to create new applications easily :

## 1) Frontend

+ AngularJS 1.4.x [official site] (https://angularjs.org/) 
+ Restangular 1.5.x [official site] (https://github.com/mgonto/restangular)

### How to :

Tip : [nvm tool] (https://github.com/creationix/nvm) is an excellent way to install any Node version

```
npm install -g bower gulp
npm install
bower install
```
execute locally 
```
gulp serve 
```
generate distribution
```
gulp build
```

## 2) Backend 

+ Grails 3.0.4 [official site] (https://grails.org/) | [REST documentation] (https://grails.github.io/grails-doc/latest/guide/webServices.html)
+ Spring Security Plugin 3.0 [plugin repository] (http://grails.org/plugin/spring-security-core)

### How to :

Tip : [gvm tool] (http://gvmtool.net/) is an excellent way to install any Grails version

execute locally 
```
grails run-app
```
generate distribution
```
grails war
```
