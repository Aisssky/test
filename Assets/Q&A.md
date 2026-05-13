### 20260217问题描述：
UE5 C++ 代码里的中文在蓝图中显示为乱码的问题
#### 解決方法：

安裝UTF-8擴展（最近輸入法突然變成繁體了；；）

然後將涉及到中文的文件在高級保存選項（找不到的話`工具-自定义`->`命令-菜单栏:文件-添加命令-类别:文件`在文件类别中,找到高级保存选项点击确定即可添加到菜单栏-文件中去了）中選擇代帶簽名的unicode-8，刷新一下UE編輯器就好了。

（搜這個問題的時候在UE開發社區有帖子，但是帖子的解決方法和後來搜到的很多鏈接都是csdn的收費貼；；）

### 20260417问题描述：

C++创建的蓝图子类重启虚幻5.6以后Failed to load ParentClass的问题，这个问题在之前做协作项目的时候也遇见过且不止一次，当时以为是我们用的版本控制总是自动同步的问题，仔细想了一下，已经不是UE和版本控制之间的问题了。



#### 解决方法：

这是一个非常常见的错误，这是实时编译的保护引发的问题。

- 先打开.sln文件 从source中buildUE编辑器，这样可以解决蓝图较C++先编译出来所以找不到C++类的问题
- 或者直接去编辑器偏好设置里左侧加载和保存中勾选上启动时强制编译。

- 下载B站up主杨羽灰针对此问题的插件（伟大……编辑器工具，我觉得可以尝试自己手搓。

- 我尝试了贴吧老哥修改项目config. ini文件定向的方法，但是这种方法好像并不符合我的实际情况 


### 20260422问题描述：

团队协作中由于“
Package /Game/Blueprints/Hero/BP_MainCharater was saved with a newer custom version than the current engine and cannot be loaded, see output log for details
Package /Game/Blueprints/Machine/Boom/BP_Boom was saved with a newer custom version than the current engine and cannot be loaded,see output log for details”导致文件丢失的问题



#### 解决方法：

PaperZD所用插件版本与团队所用版本不一致的问题，出现错误首先从日志定位问题会少走很多弯路。在Saved/Logs/下最新的日志文件搜索相关报错信息得到更完整的内容：
“[2026.04.22-04.24.31:901][  0]LogLinker: Error: [AssetLog] E:\piaomiao\Content\Blueprints\Hero\BP_MainCharater.uasset: Package was saved with a newer custom version than the current. Tag 11310AED2E554D61AF679AA3C5A1082A Name 'Paper_ZD_Version' PackageVersion 8  MaxExpected 7
[2026.04.22-04.24.31:924][  0]LogAssetRegistry: Error: Package E:/piaomiao/Content/Map/Map_0_0.umap has newer custom version of Paper_ZD_Version”

在0503帮助其他策划朋友打开项目时也遇到了FMOD插件版本不一致的问题。
