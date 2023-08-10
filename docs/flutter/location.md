---
title: 高德地图定位
---

## 相关包导入

- [amap_flutter_location](https://pub.dev/packages/amap_flutter_location/install)
- [permission_handler](https://pub.dev/packages/permission_handler/install)

## 准备工作

### 安卓端

在 android/app 下的 build.gradle 文件下添加如下代码(不加这个程序会闪退)

```
dependencies {
    //定位功能
    implementation 'com.amap.api:location:latest.integration'
		//其他
    ...
}
```

在 android/app/src/main 下的 AndroidManifest.xml 文件下添加如下代码

```
<!-- Permissions options for the `location` group -->
<!--精确定位-->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<!--粗略定位-->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<!--后台定位-->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />keytool -v -list -keystore /Users/estim/Desktop/keys/waixie_key.jkskeytool -v -list -keystore /Users/estim/Desktop/keys/waixie_key.jks
```

生成签名 jks 文件 用于获取 SHA1 码

```
keytool -v -list -keystore /Users/estim/Desktop/keys/waixie_key.jks
```

前往高德开发平台生成对应的安卓 app 用于获取对应的 key

### 苹果端

查看 ios/Runner.xcodeproj/project.pbxproj，搜索 PRODUCT_BUNDLE_IDENTIFIER 获取对应的\***\*bundle id\*\***

Info.plist 中添加 NSLocationAlwaysAndWhenInUseUsageDescription 和 NSLocationWhenInUseUsageDescription 字段

```
<key>NSLocationWhenInUseUsageDescription</key>
<string>使用APP时开启定位服务</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>使用APP时一直使用定位服务</string>
```

在 Podfile 文件中添加

```
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
     #开始
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
            '$(inherited)',
            ## dart: [PermissionGroup.location, PermissionGroup.locationAlways, PermissionGroup.locationWhenInUse]
            'PERMISSION_LOCATION=1',
          ]

        end
        # 结束
  end
end
```

配置准备工作完毕

## 代码示例

```
import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:amap_flutter_location/amap_flutter_location.dart';
import 'package:amap_flutter_location/amap_location_option.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  runApp(new MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => new _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Map<String, Object>? _locationResult;

  late StreamSubscription<Map<String, Object>> _locationListener;

  final AMapFlutterLocation _locationPlugin =  AMapFlutterLocation();

  @override
  void initState() {
    super.initState();
    /// 设置是否已经包含高德隐私政策并弹窗展示显示用户查看，如果未包含或者没有弹窗展示，高德定位SDK将不会工作
    ///
    /// 高德SDK合规使用方案请参考官网地址：https://lbs.amap.com/news/sdkhgsy
    /// <b>必须保证在调用定位功能之前调用， 建议首次启动App时弹出《隐私政策》并取得用户同意</b>
    ///
    /// 高德SDK合规使用方案请参考官网地址：https://lbs.amap.com/news/sdkhgsy
    ///
    /// [hasContains] 隐私声明中是否包含高德隐私政策说明
    ///
    /// [hasShow] 隐私权政策是否弹窗展示告知用户
    AMapFlutterLocation.updatePrivacyShow(true, true);

    /// 设置是否已经取得用户同意，如果未取得用户同意，高德定位SDK将不会工作
    ///
    /// 高德SDK合规使用方案请参考官网地址：https://lbs.amap.com/news/sdkhgsy
    ///
    /// <b>必须保证在调用定位功能之前调用, 建议首次启动App时弹出《隐私政策》并取得用户同意</b>
    ///
    /// [hasAgree] 隐私权政策是否已经取得用户同意
    AMapFlutterLocation.updatePrivacyAgree(true);

    /// 动态申请定位权限
    requestPermission();

    ///设置Android和iOS的apiKey<br>
    ///
    /// 定位Flutter插件提供了单独的设置ApiKey的接口，
    /// 使用接口的优先级高于通过Native配置ApiKey的优先级（通过Api接口配置后，通过Native配置文件设置的key将不生效），
    /// 使用时可根据实际情况决定使用哪种方式
    ///
    ///key的申请请参考高德开放平台官网说明<br>
    ///
    ///Android: https://lbs.amap.com/api/android-location-sdk/guide/create-project/get-key
    ///
    ///iOS: https://lbs.amap.com/api/ios-location-sdk/guide/create-project/get-key

    AMapFlutterLocation.setApiKey(
        "安卓key", "ios key");

    ///iOS 获取native精度类型
    if (Platform.isIOS) {
      requestAccuracyAuthorization();
    }

    ///注册定位结果监听
    _locationListener = _locationPlugin
        .onLocationChanged()
        .listen((Map<String, Object> result) {
      setState(() {
        _locationResult = result;
      });
    });
  }

  @override
  void dispose() {
    super.dispose();

    ///移除定位监听
    if (null != _locationListener) {
      _locationListener.cancel();
    }

    ///销毁定位
    if (null != _locationPlugin) {
      _locationPlugin.destroy();
    }
  }

  ///设置定位参数
  void _setLocationOption() {
    if (null != _locationPlugin) {
      AMapLocationOption locationOption =  AMapLocationOption();

      ///是否单次定位
      locationOption.onceLocation = false;

      ///是否需要返回逆地理信息
      locationOption.needAddress = true;

      ///逆地理信息的语言类型
      locationOption.geoLanguage = GeoLanguage.DEFAULT;

      locationOption.desiredLocationAccuracyAuthorizationMode =
          AMapLocationAccuracyAuthorizationMode.ReduceAccuracy;

      locationOption.fullAccuracyPurposeKey = "AMapLocationScene";

      ///设置Android端连续定位的定位间隔
      locationOption.locationInterval = 2000;

      ///设置Android端的定位模式<br>
      ///可选值：<br>
      ///<li>[AMapLocationMode.Battery_Saving]</li>
      ///<li>[AMapLocationMode.Device_Sensors]</li>
      ///<li>[AMapLocationMode.Hight_Accuracy]</li>
      locationOption.locationMode = AMapLocationMode.Hight_Accuracy;

      ///设置iOS端的定位最小更新距离<br>
      locationOption.distanceFilter = -1;

      ///设置iOS端期望的定位精度
      /// 可选值：<br>
      /// <li>[DesiredAccuracy.Best] 最高精度</li>
      /// <li>[DesiredAccuracy.BestForNavigation] 适用于导航场景的高精度 </li>
      /// <li>[DesiredAccuracy.NearestTenMeters] 10米 </li>
      /// <li>[DesiredAccuracy.Kilometer] 1000米</li>
      /// <li>[DesiredAccuracy.ThreeKilometers] 3000米</li>
      locationOption.desiredAccuracy = DesiredAccuracy.Best;

      ///设置iOS端是否允许系统暂停定位
      locationOption.pausesLocationUpdatesAutomatically = false;

      ///将定位参数设置给定位插件
      _locationPlugin.setLocationOption(locationOption);
    }
  }

  ///开始定位
  void _startLocation() {
    if (null != _locationPlugin) {
      ///开始定位之前设置定位参数
      _setLocationOption();
      _locationPlugin.startLocation();
    }
  }

  ///停止定位
  void _stopLocation() {
    if (null != _locationPlugin) {
      _locationPlugin.stopLocation();
    }
  }

  Container _createButtonContainer() {
    return  Container(
        alignment: Alignment.center,
        child:  Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
             ElevatedButton(
              onPressed: _startLocation,
              child:  const Text('开始定位'),
            ),
             Container(width: 20.0),
             ElevatedButton(
              onPressed: _stopLocation,
              child:  const Text('停止定位'),
            )
          ],
        ));
  }

  Widget _resultWidget(key, value) {
    return  Container(
      child:  Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
           Container(
            alignment: Alignment.centerRight,
            width: 100.0,
            child:  Text('$key :'),
          ),
           Container(width: 5.0),
           Flexible(child:  Text('$value', softWrap: true)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> widgets = [];
    widgets.add(_createButtonContainer());


    if (_locationResult != null) {
      _locationResult!.forEach((key, value) {
        widgets.add(_resultWidget(key, value));
      });
    }

    return  MaterialApp(
        home:  Scaffold(
          appBar:  AppBar(
            title:  const Text('定位demo'),
          ),
          body:  Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: widgets,
          ),
        ));
  }

  ///获取iOS native的accuracyAuthorization类型
  void requestAccuracyAuthorization() async {
    AMapAccuracyAuthorization currentAccuracyAuthorization =
    await _locationPlugin.getSystemAccuracyAuthorization();
    if (currentAccuracyAuthorization ==
        AMapAccuracyAuthorization.AMapAccuracyAuthorizationFullAccuracy) {
      print("精确定位类型");
    } else if (currentAccuracyAuthorization ==
        AMapAccuracyAuthorization.AMapAccuracyAuthorizationReducedAccuracy) {
      print("模糊定位类型");
    } else {
      print("未知定位类型");
    }
  }

  /// 动态申请定位权限
  void requestPermission() async {
    // 申请权限
    bool hasLocationPermission = await requestLocationPermission();
    if (hasLocationPermission) {
      print("定位权限申请通过");
    } else {
      print("定位权限申请不通过");
    }
  }

  /// 申请定位权限
  /// 授予定位权限返回true， 否则返回false
  Future<bool> requestLocationPermission() async {
    //获取当前的权限
    var status = await Permission.location.status;
    print(status);
    if (status == PermissionStatus.granted) {
      //已经授权
      return true;
    } else {
      //未授权则发起一次申请
      status = await Permission.location.request();
      if (status == PermissionStatus.granted) {
        return true;
      } else {
        return false;
      }
    }
  }
}
```

## 参数说明

```
/// `callbackTime`:回调时间，格式为"yyyy-MM-dd HH:mm:ss"
 ///
 /// `locationTime`:定位时间， 格式为"yyyy-MM-dd HH:mm:ss"
 ///
 /// `locationType`:  定位类型， 具体类型可以参考https://lbs.amap.com/api/android-location-sdk/guide/utilities/location-type
 ///
 /// `latitude`:纬度
 ///
 /// `longitude`:精度
 ///
 /// `accuracy`:精确度
 ///
 /// `altitude`:海拔, android上只有locationType==1时才会有值
 ///
 /// `bearing`: 角度，android上只有locationType==1时才会有值
 ///
 /// `speed`:速度， android上只有locationType==1时才会有值
 ///
 /// `country`: 国家，android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `province`: 省，android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `city`: 城市，android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `district`: 城镇（区），android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `street`: 街道，android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `streetNumber`: 门牌号，android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `cityCode`: 城市编码，android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `adCode`: 区域编码， android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `address`: 地址信息， android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `description`: 位置语义， android上只有通过[AMapLocationOption.needAddress]为true时才有可能返回值
 ///
 /// `errorCode`: 错误码，当定位失败时才会返回对应的错误码， 具体错误请参考：https://lbs.amap.com/api/android-location-sdk/guide/utilities/errorcode
 ///
 /// `errorInfo`: 错误信息， 当定位失败时才会返回
```
