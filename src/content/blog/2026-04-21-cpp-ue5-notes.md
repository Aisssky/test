---
title: "C++ / UE5 技术笔记"
description: "纯血 C++ 全覆盖 · 从编译到 STL · UE C++ 落地应用"
pubDate: 2026-04-21
updatedDate: 2026-07-11
subtitle: "纯血 C++ 全覆盖 · 从编译到 STL · UE C++ 落地应用（原页面日期：2026-04-21 ~ 2026-07-11）"
category: "技术"
tags:
  - C++
  - UE5
  - 面试题
  - 计算机基础
cover: /images/promo.webp
copyright: "© 2026 Aisssky | 仅供学习交流"
draft: false
toc: true
---

<span id="cpp-compile"></span>

## 🔨 编译与链接 — C++ 如何工作 <a href="#ue-build" class="ue-link-tag">UE5 构建体系</a>

理解 C++ 程序从源码到可执行文件的完整旅程，是掌握这门语言的**第一性原理**。整个流程分为**四个阶段**：

```
┌──────────────┐    ┌──────────┐    ┌───────────┐    ┌────────┐
│ 预处理       │ → │ 编译     │ → │ 汇编      │ → │ 链接   │ → 可执行文件
│ Preprocessor │    │ Compiler │    │ Assembler │    │ Linker │
└──────────────┘    └──────────┘    └───────────┘    └────────┘
  输入: .cpp+H      AST+优化      汇编→机器码      符号解析+重定位
```

### Stage 1：预处理（Preprocessing）

预处理器只处理**文本**，完全不懂 C++ 语法：

| 指令 | 行为 |
| --- | --- |
| `#include` | 将头文件内容**完整粘贴**到当前位置（递归展开） |
| `#define` | 宏定义——纯文本替换，无类型检查，无作用域 |
| `#if / #ifdef / #ifndef` | 条件编译——根据宏是否定义选择性保留/删除代码块 |
| 注释删除 | `//` 和 `/* */` 被替换为空格 |

用 `g++ -E main.cpp -o main.i` 可以看到预处理后的结果。

### Stage 2：编译（Compilation）

将预处理后的 C++ 翻译为**汇编语言**。内部又分三个子阶段：

1.  **前端（Frontend）**：词法分析 → 语法分析 → 语义分析 → 类型检查 → 生成 AST（抽象语法树）
2.  **中端（Middle-end）**：与架构无关的优化（内联展开、死代码消除、循环优化等）
3.  **后端（Backend）**：将优化后的 IR 翻译为目标平台的汇编代码

> 每个 `.cpp` 文件**独立编译**成一个 `.o`（目标文件）。编译器只看到当前翻译单元的内容——它**不知道**其他 `.cpp` 里定义了什么函数，只认识从头文件里读到的**声明**。

### Stage 3：汇编（Assembly）

把汇编代码转为**二进制机器码**（目标文件 `.o` / `.obj`）。同时生成**符号表**——记录"我提供了哪些函数/变量"和"我还需要哪些外部符号"。

### Stage 4：链接（Linking）

链接器把所有 `.o` 文件和库**拼接**成一个可执行文件：

- **符号解析**：把每个"我需要 xxx 函数"与"我提供了 xxx 函数"对上号
- **重定位**：调整所有地址，使它们在最终内存布局中正确
- **库链接**：静态库（`.a`/`.lib`）的代码复制进可执行文件；动态库（`.so`/`.dll`）运行时加载

### 常见链接错误

| 错误 | 原因 | 典型场景 |
| --- | --- | --- |
| `undefined reference to 'xxx'` | 函数被声明了但**没有定义** | 头文件里写了声明，忘了在 .cpp 中实现 |
| `multiple definition of 'xxx'` | 同一个符号在多个 .o 中**重复定义** | 在头文件里定义了非 inline 函数，多个 .cpp include 了它 |

### 翻译单元（Translation Unit）

这是 C++ 编译模型中最核心的概念：

> **一个翻译单元 = 一个 .cpp 文件 + 它直接/间接 include 的所有头文件 + 展开的宏 - 被条件编译排除的代码**

#### 📝 面试高频题

<details class="iq">
<summary>从C++源文件到可执行文件的过程？ ⭐⭐</summary>

包括四个阶段：**预处理阶段、编译阶段、汇编阶段、连接阶段**。

（1）**预处理阶段**：处理头文件包含关系，对预编译命令进行替换，生成预编译文件；

（2）**编译阶段**：将预编译文件编译，生成汇编文件（编译的过程就是把预处理完的文件进行一系列的词法分析，语法分析，语义分析及优化后生成相应的汇编代码）；

（3）**汇编阶段**：将汇编文件转换成机器码，生成可重定位目标文件（.obj文件）（汇编器是将汇编代码转变成机器可以执行的命令，每一个汇编语句几乎都对应一条机器指令。汇编相对于编译过程比较简单，根据汇编指令和机器指令的对照表一一翻译即可）；

（4）**链接阶段**：将多个目标文件和所需要的库连接成可执行文件（.exe文件）。

</details>

<details class="iq">
<summary>动态库与静态库的区别？如何选择？ ⭐</summary>

参考：《C++静态库与动态库 - 吴秦》、计算机那些事(5)——链接、静态链接、动态链接、动态链接库与静态链接库有什么区别？ - 知乎

简单来说：**静态库**在链接阶段会被直接链接进可执行文件中，随可执行文件一同发布，体积较大，但执行时无需外部依赖；**动态库**在链接阶段只记录符号引用关系，不实际复制代码，运行时由操作系统动态加载到内存，多个程序可以共享同一份动态库，减小磁盘和内存占用，更新库时只需替换动态库文件而无需重新编译主程序。

**如何选择**：需要热更新、多程序共享、减少磁盘内存占用→动态库；追求启动速度（避免运行时加载开销）、单机单程序部署、不希望暴露库实现→静态库。

</details>

<details class="iq">
<summary>如何拷贝一段数据？</summary>

（1）C++语法：`std::copy(src.begin(), src.end(), dest.begin());`

或者 `std::copy_n(src.begin(), int n, dest.begin());`

（2）C风格语法：`memcpy(void* dest, const void* src, size_t num);`

</details>

<span id="cpp-header"></span>

## 📋 头文件与预处理器 <a href="#ue-uht-guard" class="ue-link-tag">UE5 宏系统</a>

### #include 的本质

`#include` 就是**文本复制粘贴**——预处理器把整个头文件内容原封不动地插入到 `#include` 的位置。这带来两个关键后果：

1.  同一个头文件被多次 include → 内容重复 → **重复定义错误**
2.  头文件中的任何改动 → 所有 include 它的 .cpp **全部重新编译**

### 防卫式声明（Include Guard）

防止同一个头文件在一个翻译单元中被多次包含：

```
// 传统写法（C/C++ 标准）
#ifndef MY_HEADER_H
#define MY_HEADER_H
// ... 头文件内容 ...
#endif

// 现代写法（编译器扩展，几乎通用）
#pragma once
```

|  | `#ifndef` 宏守卫 | `#pragma once` |
| --- | --- | --- |
| 标准 | C/C++ 标准 | 编译器扩展（GCC/MSVC/Clang 都支持） |
| 原理 | 检查宏是否已定义 | 编译器记住文件路径，不重复打开 |
| 风险 | 宏名可能冲突 | 硬链接/符号链接可能被当成不同文件 |

### 宏（Macro）

```
#define PI 3.14159           // 对象宏
#define SQUARE(x) ((x)*(x))  // 函数宏——注意括号！没有括号会有优先级bug
#define MAX(a,b) ((a)>(b)?(a):(b))

// 预定义宏
__FILE__   // 当前文件名
__LINE__   // 当前行号
__DATE__   // 编译日期
__FUNCTION__ // 当前函数名（非标准但广泛支持）
```

> ⚠️ 宏是**纯文本替换**——没有类型检查、没有作用域、不懂 C++ 语义。现代 C++ 推荐用 `constexpr` 和 `inline` 函数替代大多数宏。

### 条件编译

```
#ifdef DEBUG
    std::cout << "Debug mode\n";
#endif

#if defined(_WIN32)
    // Windows 代码
#elif defined(__linux__)
    // Linux 代码
#endif
```

#### 📝 面试高频题

<details class="iq">
<summary>内联函数 vs 宏的区别？ ⭐</summary>

（1）define宏命令是在**预处理阶段**对命令进行替换，inline是在**编译阶段**在函数调用点处直接展开函数，节省了函数调用的开销；

（2）define的话是**不会对参数的类型进行检查**的，因此会出现类型安全的问题，比如定义一个max命令，但是传递的时候可能会传递一个整数和一个字符串，就会出错，但是内联函数在编译阶段会**进行类型检查**；

（3）使用宏的时候可能要添加**很多括号**，比较容易出错。

</details>

<details class="iq">
<summary>内联函数的优缺点？</summary>

（1）作用是使编译器在函数调用点上展开函数，可以**避免函数调用的开销**；

（2）内联函数的缺点是可能造成**代码膨胀**，尤其是递归的函数，会造成大量内存开销，exe太大，占用CPU资源。此外，内联函数**不方便调试**，每次修改会重新编译头文件，增加编译时间。

</details>

<span id="cpp-types"></span>

## 📐 变量与数据类型 <a href="#ue-types" class="ue-link-tag">UE5 类型体系</a>

### 基础类型表

| 类型 | 大小 (字节) | 范围 | 说明 |
| --- | --- | --- | --- |
| `char` | 1 | \-128 ~ 127 | 字符/最小整数。'a'=97, 'A'=65 |
| `short` | 2 | \-32768 ~ 32767 | 短整数 |
| `int` | 4 | ~ ±21 亿 | 默认整数类型 |
| `long` | 4 (Win) / 8 (Linux) | — | 平台相关 |
| `long long` | 8 | ~ ±9×10¹⁸ | 64 位整数 |
| `float` | 4 | ~7 位有效数字 | 单精度浮点，后缀 `f` |
| `double` | 8 | ~15 位有效数字 | 双精度浮点，默认 |
| `bool` | 1 | true / false | 布尔值 |

用 `sizeof(类型/变量)` 可以求出任意类型占用的字节数。

### 转义字符

<table><tbody><tr><td><code>\n</code></td><td>换行</td><td><code>\t</code></td><td>水平制表</td><td><code>\\</code></td><td>反斜杠</td></tr><tr><td><code>\"</code></td><td>双引号</td><td><code>\'</code></td><td>单引号</td><td><code>\0</code></td><td>空字符(=0)</td></tr></tbody></table>

### const 与 constexpr

```
const int MAX = 100;          // 运行期或编译期常量（取决于上下文）
constexpr int SIZE = 1024;    // 强制编译期求值
constexpr int Double(int x) { return x * 2; }  // 编译期函数
```

`const` 表示"我不会修改它"，`constexpr` 表示"编译器**必须**在编译期算出它的值"。

### static 关键字（三种含义）

| 场景 | 含义 |
| --- | --- |
| 函数内的 `static` 局部变量 | 生命周期 = 整个程序，但作用域限于函数内。只初始化一次。 |
| 类中的 `static` 成员 | 属于类本身，所有对象共享。static 方法没有 `this` 指针。 |
| 全局/命名空间的 `static` | 内部链接——只在当前翻译单元可见，其他 .cpp 访问不到。 |

#### 📝 面试高频题

<details class="iq">
<summary>const 的作用？指针常量 vs 常量指针？</summary>

（1）const修饰符用来定义常量，具有不可变性。在类中，被const修饰的成员函数，不能修改类中的数据成员；

（2）**指针常量**指的是该指针本身是一个常量，不能被修改，但是指针指向的对象可以被修改；**常量指针**指的是这个指针指向的对象是一个常量，不能被修改，但是指针本身可以被修改。这涉及到一个顶层const和底层const的概念：顶层const，本身是const；底层const，指向的对象是const；

（3）const修饰的函数**可以重载**。const成员函数既不能改变类内的数据成员，也无法调用非const的成员函数；const类对象只能调用const成员函数，非const对象无论是否是const成员函数都能调用，但是如果有重载的非const函数，非const对象会优先调用重载后的非const函数。

</details>

<details class="iq">
<summary>static 的三种含义？何时初始化？</summary>

1) **文件域**：内部链接，仅本文件可见，避免重定义

2) **函数内局部**：全局生命周期，只初始化一次，函数内可见

3) **类静态成员**：所有对象共享，static方法无this指针

文件域和类静态成员在**main()执行前**初始化；局部静态变量在**第一次使用时**初始化。

</details>

<details class="iq">
<summary>extern 的作用？</summary>

1) **extern "C"**：告诉编译器用C的规则编译函数名（而非C++名称修饰），用于C/C++混合编程。

2) **外部声明**：提示编译器此变量或函数在**其他模块中定义**，本文件只是引用。

</details>

<details class="iq">
<summary>explicit 的作用？</summary>

标明类的构造函数是**显式**的，**禁止隐式类型转换**。防止如 `MyClass obj = 5;` 这种隐式调用单参构造函数的情况，避免意外的类型转换bug。

</details>

<details class="iq">
<summary>constexpr 的作用？</summary>

明确告诉编译器去验证函数或变量在**编译期是否应该是一个常数**，以便编译器大胆优化。

const只表示"我不会修改"，但值可能是运行期确定的；constexpr强制**编译期求值**。

</details>

<details class="iq">
<summary>volatile 的作用？</summary>

告诉编译器**每次操作该变量时一定要从内存中真正取出**，而不是使用已经存在寄存器中的备份。常用于硬件寄存器访问、多线程共享变量（但C++11后多线程建议用atomic）。

</details>

<details class="iq">
<summary>mutable 的作用？</summary>

允许被声明为const的成员函数**修改**类中被mutable修饰的非静态成员变量。典型场景：缓存、互斥锁等"逻辑上不改变对象状态"但需要修改的成员。

</details>

<span id="cpp-pointer"></span>

## 👉 指针与引用 <a href="#ue-pointer" class="ue-link-tag">UE5 智能指针</a>

指针和引用是 C++ 区别于大多数高级语言的**核心特性**——它们让你直接操作内存地址。

### 指针基础

```
int x = 42;
int* ptr = &x;       // & = 取地址，ptr 存储 x 的内存地址
int y = *ptr;        // * = 解引用，读取 ptr 指向的值（y = 42）
*ptr = 100;          // 通过指针修改 x 的值（x 变成 100）

int* nullPtr = nullptr;  // C++11：空指针，替代 NULL 和 0
```

### 指针与数组

```
int arr[5] = {1, 2, 3, 4, 5};
int* p = arr;         // 数组名退化为指向首元素的指针
p[2] == arr[2];       // true —— 指针可以用下标访问
*(p + 2) == arr[2];   // true —— 指针算术：+n 移动 n 个元素的距离
```

### 引用

```
int a = 10;
int& ref = a;         // ref 是 a 的别名——不能为 null，不能重新绑定
ref = 20;             // 等价于 a = 20
```

### 指针 vs 引用

| 指针 | 引用 |
| --- | --- |
| 可以 `nullptr` | 必须有初始值，不能为空 |
| 可以重新指向别的变量 | 一旦绑定，终身不可更改 |
| 需要 `*` 解引用 | 直接使用，语法更干净 |
| 有自己独立的地址 | 只是别名，不占独立内存（通常实现为指针） |
| 用于：可选参数、动态内存、遍历 | 用于：参数传递避免拷贝、链式调用 |

### 函数指针

```
void Print(int x) { std::cout << x; }
void (*funcPtr)(int) = Print;   // 函数指针：存储函数地址
funcPtr(42);                     // 通过指针调用函数

// 现代替代：std::function + lambda
#include <functional>
std::function<void(int)> f = Print;
```

#### 📝 面试高频题

<details class="iq">
<summary>智能指针有哪些？各自作用？</summary>

智能指针主要解决一个**内存泄露**的问题，它可以自动地释放内存空间。因为它本身是一个类，当函数结束的时候会调用析构函数，并由析构函数释放内存空间。智能指针分为共享指针(shared\_ptr)，独占指针(unique\_ptr)和弱指针(weak\_ptr)：

（1）**shared\_ptr**，多个共享指针可以指向相同的对象，采用了**引用计数的机制**，当最后一个引用销毁时，释放内存空间；

（2）**unique\_ptr**，保证同一时间段内只有一个智能指针能指向该对象（可通过move操作来传递unique\_ptr）；

（3）**weak\_ptr**，用来解决shared\_ptr相互引用时的**死锁问题**，如果说两个shared\_ptr相互引用，那么这两个指针的引用计数永远不可能下降为0，资源永远不会释放。它是对对象的一种弱引用，不会增加对象的引用计数，和shared\_ptr之间可以相互转化，shared\_ptr可以直接赋值给它，它可以通过调用lock函数来获得shared\_ptr。

**shared\_ptr实现原理**：通过引用计数机制实现，引用计数存储着有几个shared\_ptr指向相同的对象，当引用计数下降至0时就会自动销毁这个对象。具体实现：1）构造函数将指针指向该对象，引用计数置为1；2）拷贝构造函数将指针指向该对象，引用计数++；3）赋值运算符=号左边的shared\_ptr的引用计数-1，右边的shared\_ptr的引用计数+1，如果左边的引用计数降为0，还要销毁shared\_ptr指向对象，释放内存空间。

shared\_ptr的引用计数本身是**安全且无锁**的，但是它指向的对象的读写则不是，因此可以说shared\_ptr**不是线程安全**的。

**为什么不用raw ptr解决循环引用？**一个weak\_ptr绑定到shared\_ptr之后不会增加引用计数，一旦最后一个指向对象的shared\_ptr被销毁，对象就会被释放，即使weak\_ptr指向对象，也还是会释放；raw指针，当对象销毁之后会变成悬浮指针。

</details>

<details class="iq">
<summary>指针和引用的区别？</summary>

1) 指针是地址，有独立内存空间；引用只是别名

2) 指针可重新指向；引用初始化后不可改变绑定

3) 指针可为nullptr；引用必须初始化为已有对象

4) 指针可多级（int\*\*）；引用只能一级

</details>

<span id="cpp-function"></span>

## ⚡ 函数进阶 <a href="#ue-delegate" class="ue-link-tag">UE5 委托系统</a>

### 函数重载（Overloading）

C++ 允许**同名函数**，只要参数列表不同（类型、数量、顺序）。编译器通过参数类型自动选择正确的版本：

```
void Log(int x)    { std::cout << "int: " << x; }
void Log(float x)  { std::cout << "float: " << x; }
void Log(int x, int y) { std::cout << x << ", " << y; }

Log(5);       // 调用 Log(int)
Log(3.14f);   // 调用 Log(float)
Log(1, 2);    // 调用 Log(int, int)
```

> 注意：返回值类型不同**不能**构成重载。编译器通过参数推断，不是返回值。

### 默认参数

```
void DrawCircle(float radius, int segments = 32, float r = 1.0f, float g = 1.0f, float b = 1.0f);
// 调用：DrawCircle(10.0f) 使用默认 segments=32, 白色
// 调用：DrawCircle(10.0f, 64) 使用默认白色
```

默认参数**必须从右向左连续**设置。声明和定义不能同时指定默认参数。

### InLine 内联

```
inline int Add(int a, int b) { return a + b; }
// 调用 Add(3, 5) → 编译器可能直接替换为 3 + 5，消除函数调用开销
```

函数调用有开销（压栈、跳转、返回、出栈）。对于**极短小、频繁调用**的函数，`inline` 可以消除这个开销。

但 `inline` 的**现代核心意义**已经不是"展开优化"，而是：

> **允许同一个函数定义出现在多个翻译单元中，而不违反 ODR（单一定义规则）**。这让短函数可以安全地写在头文件里。

### Lambda 表达式（C++11）

```
// 完整语法：[捕获列表](参数列表) -> 返回类型 { 函数体 }
auto add = [](int a, int b) -> int { return a + b; };
auto result = add(3, 5);  // 8

// 捕获外部变量
int base = 10;
auto plus = [base](int x) { return base + x; };  // 值捕获
auto inc  = [&base](int x) { base += x; };        // 引用捕获
auto all  = [=](int x) { /* 所有外部变量值捕获 */ };
auto allRef = [&](int x) { /* 所有外部变量引用捕获 */ };
```

| 捕获方式 | 语法 | 含义 |
| --- | --- | --- |
| 值捕获 | `[x]` | 拷贝一份，lambda 内外互不影响 |
| 引用捕获 | `[&x]` | 外部变量变化影响 lambda 内部，反之亦然 |
| 全部值捕获 | `[=]` | 所有用到外部变量都拷贝 |
| 全部引用捕获 | `[&]` | 所有用到外部变量都引用 |

#### 📝 面试高频题

<details class="iq">
<summary>左值右值？右值引用？为什么引入？</summary>

（1）**左值**就是具有可寻址的存储单元，并且能由用户改变其值的量，比如常见的变量：一个int，float，class等。左值具有持久的状态，直到离开作用域才销毁；**右值**表示即将销毁的临时对象，具有短暂的状态，比如字面值常量"hello"，返回非引用类型的表达式int func()等，都会生成右值；

（2）**右值引用**就是必须绑定到右值的引用，可以通过&&（两个取地址符）来获得右值引用；右值引用只能绑定到即将销毁的对象，因此可以自由地移动其资源；

（3）右值引用是为了**支持移动操作**而引出的一个概念，它只能绑定到一个将要销毁的对象，使用右值引用的移动操作可以避免无谓的拷贝，提高性能。使用std::move()函数可以将一个左值转换为右值引用。（可以通过两个很长的字符串的直接赋值和移动赋值来测试一下性能的差距）。

</details>

<details class="iq">
<summary>深拷贝 vs 浅拷贝？移动构造？</summary>

**为什么要自己定义拷贝构造函数？**拷贝构造函数的作用就是定义了当我们用同类型的另外一个对象初始化本对象的时候做了什么，在某些情况下，如果我们不自己定义拷贝构造函数，使用默认的拷贝构造函数，就会出错。比如一个类里面有一个指针，如果使用默认的拷贝构造函数，会将指针拷贝过去，即两个指针指向同个对象，那么其中一个类对象析构之后，这个指针也会被delete掉，那么另一个类里面的指针就会变成**野指针（悬浮指针）**；

这也正是**深拷贝和浅拷贝**的区别，浅拷贝只是简单直接地复制指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存。但深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象；

**移动构造函数**需要传递的参数是一个右值引用，移动构造函数**不分配新内存**，而是接管传递而来对象的内存，并在移动之后把源对象销毁；拷贝构造函数需要传递一个左值引用，可能会造成重新分配内存，性能更低。

</details>

<details class="iq">
<summary>重载、重写和隐藏的区别？</summary>

（1）**重载**：同一个名字的函数，具有不同的参数列表（参数类型、个数），根据参数列表决定调用哪一个函数；

（2）**重写（覆盖）**：派生类中的函数重写了基类中的虚函数，重写的基类的中函数必须被声明为virtual，并且返回值、参数列表和基类中的函数一致；

（3）**隐藏**：派生类中的同名函数把基类中的同名函数隐藏了，即基类同名函数被屏蔽掉；此时基类函数不能声明为virtual。

</details>

<span id="cpp-memory"></span>

## 🧠 内存管理 <a href="#ue-memory" class="ue-link-tag">UE5 GC 系统</a>

### 栈 vs 堆

|  | 栈 (Stack) | 堆 (Heap) |
| --- | --- | --- |
| 分配方式 | 自动：进入作用域自动分配，离开自动释放 | 手动：`new` 分配，`delete` 释放 |
| 速度 | 极快（移动栈指针） | 慢（需要在空闲链表中找合适的块） |
| 大小 | 较小（通常 ~1-8 MB） | 很大（受物理内存限制） |
| 生命周期 | 作用域结束即销毁 | 手动 delete 或程序结束时回收 |
| 碎片 | 无碎片 | 可能产生内存碎片 |
| 典型用途 | 局部变量、函数参数、小型对象 | 大型对象、动态数组、生命周期不确定的对象 |

### new / delete

```
// 单个对象
int* p = new int(42);    // 在堆上分配，初始化为 42
delete p;                 // 释放内存

// 数组
int* arr = new int[100];  // 分配 100 个 int
delete[] arr;              // 释放数组——注意 delete[] 不是 delete

// 带定位的 new（placement new）
#include <new>
char buffer[sizeof(MyClass)];
MyClass* obj = new (buffer) MyClass();  // 在指定内存地址构造对象
```

### RAII（Resource Acquisition Is Initialization）

这是 C++ **最重要的资源管理范式**：

> **在构造函数中获取资源，在析构函数中释放资源。让对象的生命周期来管理资源。**

```
class FileHandle {
    FILE* file;
public:
    FileHandle(const char* path) : file(fopen(path, "r")) {}  // 构造时获取
    ~FileHandle() { if (file) fclose(file); }                  // 析构时释放
    // 禁止拷贝，允许移动...
};
```

RAII 保证了**即使发生异常**，资源也能被正确释放。这是 C++ 不需要 GC（垃圾回收）的关键原因。

### 智能指针（C++11）

```
#include <memory>

// unique_ptr：独占所有权，不能拷贝，只能移动
std::unique_ptr<int> p1 = std::make_unique<int>(42);
auto p2 = std::move(p1);  // p1 为空，p2 接管所有权

// shared_ptr：共享所有权，引用计数
std::shared_ptr<int> s1 = std::make_shared<int>(100);
auto s2 = s1;  // 引用计数 = 2，两个指针共享同一个对象
// 最后一个 shared_ptr 销毁时自动 delete

// weak_ptr：观察者，不影响引用计数，用于打破循环引用
std::weak_ptr<int> w = s1;
if (auto sp = w.lock()) { /* 使用 sp */ }
```

| 类型 | 所有权 | 何时使用 |
| --- | --- | --- |
| `unique_ptr` | 独占 | 默认首选——工厂函数、PIMPL、容器中的指针 |
| `shared_ptr` | 共享 | 多个所有者（少用——通常设计问题） |
| `weak_ptr` | 观察 | 缓存、观察者模式、打破 `shared_ptr` 循环引用 |

> 💡 经验法则：默认用 **栈对象**；需要堆分配时用 `unique_ptr`；只有在真正需要共享所有权时才用 `shared_ptr`。

#### 📝 面试高频题

<details class="iq">
<summary>C++有哪些内存区域？</summary>

（1）**堆**，使用malloc、free动态分配和释放空间，能分配较大的内存；

（2）**栈**，为函数的局部变量分配内存，能分配较小的内存；

（3）**全局/静态存储区**，用于存储全局变量和静态变量；

（4）**常量存储区**，专门用来存放常量；

（5）**自由存储区**：通过new和delete分配和释放空间的内存，具体实现可能是堆或者内存池。

**补充**：堆是C和操作系统的术语，自由存储区是C++的术语，指的是通过new和delete动态分配和释放对象的抽象概念；基本上C++也会用堆区实现自由存储，但程序员可以通过重载操作符，改用其他内存实现自由存储，比如全局变量做的对象池。

</details>

<details class="iq">
<summary>堆和栈的区别？</summary>

（1）堆中的内存需要**手动申请和手动释放**，栈中内存是由**OS自动申请和自动释放**；

（2）堆能分配的内存较大（**4G**，32位机器），栈能分配的内存较小（**1M**）；

（3）在堆中分配和释放内存**会产生内存碎片**，栈不会产生内存碎片；

（4）堆的**分配效率低**，栈的**分配效率高**；

（5）堆地址从低向上，栈由高向下。

</details>

<details class="iq">
<summary>new/delete vs malloc/free？</summary>

C使用**malloc/free**，C++使用**new/delete**，前者是C语言中的库函数，后者是C++语言的运算符。对于自定义对象，malloc/free只进行分配内存和释放内存，无法调用其构造函数和析构函数，只有new/delete能做到，完成对象的空间分配和初始化，以及对象的销毁和释放空间。具体区别如下：

（1）new分配内存空间**无需指定**分配内存大小，malloc需要；

（2）new返回**类型指针**，类型安全，malloc返回void\*，再强制转换成所需要的类型；

（3）new是从**自由存储区**获得内存，malloc从**堆**中获取内存；

（4）对于类对象，new会**调用构造函数和析构函数**，malloc不会（核心区别）；

（5）**不能混用**。

</details>

<details class="iq">
<summary>什么是内存对齐？为什么需要？</summary>

（1）**内存对齐的原因**：关键在于CPU存取数据的效率问题。为了提高效率，计算机从内存中取数据是按照一个固定长度的。比如在32位机上，CPU每次都是取32bit数据的，也就是4字节；若不进行对齐，要取出两块地址中的数据，进行掩码和移位等操作，写入目标寄存器内存，效率很低。内存对齐一方面可以节省内存，一方面可以提升数据读取的速度；

（2）**内容**：内存对齐指的是C++结构体中的数据成员，其内存地址是否为其对齐字节大小的倍数；

（3）**对齐原则**：1）结构体变量的首地址能够被其最宽基本类型成员的对齐值所整除；2）结构体内每一个成员的相对于起始地址的偏移量能够被该变量的大小整除；3）结构体总体大小能够被最宽成员大小整除；如果不满足这些条件，编译器就会进行一个填充(padding)；

（4）**如何对齐**：声明数据结构时，字节对齐的数据依次声明，然后小成员组合在一起，能省去一些浪费的空间，不要把小成员参杂声明在字节对齐的数据之间。

</details>

<details class="iq">
<summary>什么是对象池？有什么作用？</summary>

对于**需要频繁创建和销毁**的对象，预先创建一批对象放入"池"中。使用时从池中取出（激活），用完后**不删除**，而是设为不激活状态放回池中等待复用。

优势：避免频繁new/delete的开销和内存碎片。在游戏开发中广泛用于子弹、粒子、音效等高频短生命周期对象。

</details>

<span id="cpp-oop"></span>

## 🏛️ 面向对象编程 <a href="#ue-oop" class="ue-link-tag">UE5 对象模型</a>

### 类与对象

```
class Player {
private:          // 只有本类可访问
    int health;
    std::string name;

public:           // 所有人都可访问
    Player(const std::string& n, int h) : health(h), name(n) {}  // 构造函数

    void TakeDamage(int damage) { health -= damage; }
    int GetHealth() const { return health; }  // const 方法：不修改成员

    ~Player() { /* 析构：清理资源 */ }
};
```

### class vs struct

**唯一的区别**：`class` 默认访问权限是 `private`，`struct` 默认是 `public`。除此之外完全一样。

惯用法：`struct` 用于纯数据容器（POD），`class` 用于有行为逻辑的对象。

### 构造函数与析构函数

```
class MyClass {
public:
    MyClass() = default;                    // 默认构造
    MyClass(int x) : value(x) {}            // 带参构造
    MyClass(const MyClass& other) = delete; // 禁止拷贝
    MyClass(MyClass&& other) noexcept;      // 移动构造（C++11）
    ~MyClass();                              // 析构函数（最多一个）
private:
    int value;
};
```

**成员初始化列表**（`: value(x)`）比在函数体内赋值**更高效**——直接初始化，跳过了"默认初始化 + 赋值"两步。

### 访问控制

| 修饰符 | 本类 | 派生类 | 外部 |
| --- | --- | --- | --- |
| `public` | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |

### 继承

```
class Animal {
protected:
    int age;
public:
    Animal(int a) : age(a) {}
    virtual ~Animal() {}         // 基类析构函数必须 virtual！
};

class Dog : public Animal {      // public 继承：is-a 关系
    std::string breed;
public:
    Dog(int a, const std::string& b) : Animal(a), breed(b) {}
};
```

### 虚函数与多态

这是面向对象**最核心**的机制——在运行时根据对象的**实际类型**选择正确的函数：

```
class Animal {
public:
    virtual void Speak() const { std::cout << "???\n"; }
    virtual ~Animal() {}  // 虚析构：确保派生类析构函数被正确调用
};

class Dog : public Animal {
public:
    void Speak() const override { std::cout << "Woof!\n"; }
};

class Cat : public Animal {
public:
    void Speak() const override { std::cout << "Meow!\n"; }
};

Animal* ptr = new Dog();
ptr->Speak();   // 输出 "Woof!" —— 虽然 ptr 是 Animal*，但调用了 Dog::Speak
delete ptr;     // 正确调用 ~Dog() 再 ~Animal()
```

### 虚函数表（VTable）——多态的实现原理

```
┌─────────────────────┐       ┌──────────────────────┐
│  Animal 对象        │       │  Animal vtable       │
│  ┌───────────────┐  │       │  [0] → &Animal::Speak│
│  │ __vptr (8B)   │──┼──────→│  [1] → &Animal::~A   │
│  │ age           │  │       └──────────────────────┘
│  └───────────────┘  │
└─────────────────────┘

┌─────────────────────┐       ┌──────────────────────┐
│  Dog 对象           │       │  Dog vtable          │
│  ┌───────────────┐  │       │  [0] → &Dog::Speak   │  ← 覆盖了基类
│  │ __vptr (8B)   │──┼──────→│  [1] → &Dog::~Dog    │
│  │ age           │  │       └──────────────────────┘
│  │ breed         │  │
│  └───────────────┘  │
└─────────────────────┘
```

1.  每个**有多态行为的类**有一个**虚函数表**（vtable）——存储所有虚函数的地址
2.  每个**对象**包含一个隐藏的 `__vptr` 指针，指向它所属类的 vtable
3.  `ptr->Speak()` 实际变成：`ptr->__vptr[0](ptr)` —— 一次间接寻址
4.  构造函数会将 `__vptr` 设置为**正在构造的那个类的 vtable**

### 纯虚函数与抽象类

```
class IShape {  // "I" 前缀是 UE5/业界惯用的接口命名
public:
    virtual float GetArea() const = 0;  // 纯虚函数——没有实现
    virtual ~IShape() = default;        // 虚析构
};
// IShape shape;  // ❌ 不能实例化抽象类

class Circle : public IShape {
    float radius;
public:
    Circle(float r) : radius(r) {}
    float GetArea() const override { return 3.14159f * radius * radius; }
};
```

### 运算符重载

```
struct Vector2 {
    float x, y;
    Vector2 operator+(const Vector2& other) const {
        return {x + other.x, y + other.y};
    }
    bool operator==(const Vector2& other) const {
        return x == other.x && y == other.y;
    }
};
Vector2 v3 = Vector2{1,2} + Vector2{3,4};  // {4, 6}
```

大多数运算符都可以重载。不能重载的：`::` `.` `.*` `?:` `sizeof` `typeid`。

#### 📝 面试高频题

<details class="iq">
<summary>什么是多态？C++如何实现？</summary>

**所谓多态，就是同一个函数名具有多种状态，或者说一个接口具有不同的行为**；C++的多态分为**编译时多态**和**运行时多态**，编译时多态也称为静态联编，通过**重载和模板**来实现，运行时多态称为动态联编，通过**继承和虚函数**来实现。

</details>

<details class="iq">
<summary>虚函数的实现机制？</summary>

虚函数是通过**虚函数表**来实现的，虚函数表包含了一个类(所有)的虚函数的地址，在有虚函数的类对象中，它内存空间的头部会有一个**虚函数表指针(虚表指针)**，用来管理虚函数表。当子类对象对父类虚函数进行重写的时候，虚函数表的相应虚函数地址会发生改变，改写成这个虚函数的地址，当我们用一个父类的指针来操作子类对象的时候，它可以指明实际所调用的函数。

**虚函数调用是运行时确定**，通过查找虚函数表中的函数地址确定。（补充：只有通过指针或者引用的方式调用虚函数是运行时确定，通过值调用的虚函数是编译期就可以确定的。）

**虚函数存在类中**，不同的类对象共享一张虚函数表（为了节省内存空间）。

在基类的**构造函数和析构函数中调用虚函数**：从语法上讲调用没有问题，但从效果上看，往往不能达到需要的目的（不能实现多态）；因为调用构造函数的时候，是先进行父类成分的构造，再进行子类的构造。在父类构造期间，子类的特有成分还没有被初始化，此时下降到调用子类的虚函数，使用这些尚未初始化的数据一定会出错；同理，调用析构函数的时候，先对子类的成分进行析构，当进入父类的析构函数的时候，子类的特有成分已经销毁，此时是无法再调用虚函数实现多态的。

</details>

<details class="iq">
<summary>菱形继承的问题与解决？</summary>

会存在**二义性**的问题，因为两个父类会对公共基类的数据和方法产生一份拷贝，因此对于子类来说读写一个公共基类的数据或调用一个方法时，不知道是哪一个父类的数据和方法，也会导致编译错误。可以采用**虚继承**的方法解决这个问题（父类继承公共基类时用virtual修饰），这样就只会创造一份公共基类的实例，不会造成二义性。

</details>

<details class="iq">
<summary>C++类型转换关键字有哪些？</summary>

（1）**const\_cast**：把const属性去掉，即将const转换为非const（也可以反过来），const\_cast只能用于指针或引用，并且只能改变对象的底层const（顶层const即本身是const，底层const即指向对象const）；

（2）**static\_cast**：隐式类型转换，可以实现C++中内置基本数据类型之间的相互转换，enum、struct、int、char、float等，能进行类层次间的向上类型转换和向下类型转换（向下不安全，因为没有进行动态类型检查）。它不能进行无关类型(如非基类和子类)指针之间的转换，也不能作用包含底层const的对象；

（3）**dynamic\_cast**：动态类型转换，用于将基类的指针或引用安全地转换成派生类的指针或引用（也可以向上转换），若指针转换失败返回NULL，若引用返回失败抛出bad\_cast异常。dynamic\_cast是在运行时进行安全性检查；使用dynamic\_cast父类一定要有虚函数，否则编译不通过；

（4）**reinterpret\_cast**：reinterpret是重新解释的意思，此标识符的意思即为将数据的二进制形式重新解释，但是不改变其值，有着和C风格的强制转换同样的能力。它可以转化任何内置的数据类型为其他任何的数据类型，也可以转化任何指针类型为其他的类型。它甚至可以转化内置的数据类型为指针，无须考虑类型安全或者常量的情形。不到万不得已绝对不用（比较不安全）。

**static\_cast和dynamic\_cast的异同**：二者都会做类型安全检查，只是static\_cast在编译期进行类型检查，dynamic\_cast在运行期进行类型检查。后者需要父类具备虚函数，而前者不需要。

</details>

<details class="iq">
<summary>类对象的内存模型？</summary>

1) 有虚函数→虚表指针始终在内存头部

2) 按继承顺序(父→子)和字段声明顺序布局

3) 多继承：每个含虚函数的父类各有自己的虚表，子类新虚函数加到第一个虚表后

4) 虚继承：各父类(含虚表)→子类→公共基类(含虚表)，父类不再拷贝公共基类数据

</details>

<details class="iq">
<summary>Delete和Delete[]的区别？</summary>

基本类型效果一样。自定义类：delete只释放第一个元素+调一次析构，delete\[\]调所有元素析构+释放全部内存。

new\[\]对象数组时多分配4字节存储数组大小，delete\[\]时取出来确定析构次数。

</details>

<details class="iq">
<summary>C语言能实现虚函数机制吗？</summary>

可以，需要手工完成：1) 手动构造父子关系（结构体嵌套）2) 创建虚函数表（函数指针数组）3) 设置虚表指针指向虚函数表 4) 填充各虚函数地址 5) 虚函数重写时手动替换函数指针。本质上就是用C语言把C++编译器自动做的事情手工做一遍。

</details>

<span id="cpp-template"></span>

## 📦 模板与泛型编程 <a href="#ue-template" class="ue-link-tag">UE5 模板应用</a>

模板是 C++ 的"编译期代码生成器"——你写一套逻辑，编译器为每种使用的类型自动生成一份代码。

### 函数模板

```
template<typename T>
T Max(T a, T b) {
    return (a > b) ? a : b;
}

int    i = Max(3, 5);        // 编译器生成 Max<int>
float  f = Max(3.14f, 2.7f); // 编译器生成 Max<float>
// 每个不同的 T 都会生成一份独立的函数代码
```

### 类模板

```
template<typename T, int Capacity = 64>
class Stack {
    T data[Capacity];
    int count = 0;
public:
    void Push(const T& item) { data[count++] = item; }
    T Pop() { return data[--count]; }
};

Stack<int, 128> intStack;    // int 类型，容量 128
Stack<std::string> strStack;  // string 类型，容量默认 64
```

### 模板特化

```
// 通用模板
template<typename T> class DataHolder { /* 通用实现 */ };

// 全特化：为 bool 写一套完全不同的实现
template<>
class DataHolder<bool> { /* 针对 bool 的特殊实现（比如用位存储） */ };

// 偏特化：为指针类型写特殊实现
template<typename T>
class DataHolder<T*> { /* 针对指针的特殊实现 */ };
```

#### 📝 面试高频题

<details class="iq">
<summary>auto 和 decltype 的作用和区别？</summary>

两者都用于**类型自动推导**，让编译器自动推断变量类型。

**区别**：auto不能用于函数传参和推导数组类型；decltype可以解决这些问题，且decltype会保留引用和const属性。

</details>

<span id="cpp-stl"></span>

## 🗂️ STL 标准模板库（侯捷 · 源码剖析视角） <a href="#ue-containers" class="ue-link-tag">UE5 容器对比</a>

> "使用一个东西，却不明白它的道理，不高明！" —— 侯捷《STL源码剖析》

STL 不仅仅是"用好容器和算法"，更要理解**六大部件如何协作**、**底层数据结构如何实现**、**泛型编程如何通过 traits 和 tag dispatch 做到零开销抽象**。

### 🏗️ 一、STL 六大部件（Components）

侯捷老师将 STL 归纳为**六大部件**，它们的关系如下：

```
                         ┌──────────────────────┐
                         │     Algorithms (算法)  │
                         │  sort, find, count...  │
                         └──────────┬───────────┘
                                    │ 通过 Iterators 操作数据
                                    ▼
  ┌───────────┐          ┌──────────────────────┐          ┌───────────┐
  │ Allocators│ ◄─────── │   Containers (容器)   │ ◄─────── │  Adapters │
  │ (分配器)   │ 管理内存  │ vector, list, map... │  改造接口 │ (适配器)   │
  └───────────┘          └──────────┬───────────┘          └───────────┘
                                    │ 通过 Iterators 访问元素
                                    ▼
                         ┌──────────────────────┐
                         │   Iterators (迭代器)   │
                         │  泛化指针, traits技法  │
                         └──────────┬───────────┘
                                    │ 协助算法完成策略变化
                                    ▼
                         ┌──────────────────────┐
                         │  Functors (仿函数)     │
                         │  less<T>, greater<T>  │
                         └──────────────────────┘
```

一句代码串联六大部件：

```
//   [容器]          [分配器]        [算法]   [迭代器]    [仿函数+适配器]
std::vector<int, std::allocator<int>> vi {5,2,8,1,9};
int cnt = std::count_if(vi.begin(), vi.end(),
                        std::not1(std::bind2nd(std::less<int>(), 40)));
//                       ↑ 适配器    ↑ 适配器    ↑ 仿函数
```

### 🧩 二、空间配置器（Allocator）

容器需要内存，但 `new/delete` 背后是 `malloc/free`，频繁申请小块内存有两个问题：

1.  **cookie 开销**：`malloc` 每次分配都要在内存块首尾记录大小（各 4 字节），供 `free` 时知道要释放多少。频繁分配小块内存 → cookie 占比巨大。
2.  **系统调用开销**：`malloc` 最终要进内核，开销远大于用户态操作。

#### SGI STL 的双层配置器

这是侯捷老师重点讲解的经典设计——GCC 2.9 SGI STL 使用名为 `alloc` 的分配器：

```
// 16 条自由链表（free_list），每条管理固定大小的内存块：
// free_list[0]  → 管理 8 字节块
// free_list[1]  → 管理 16 字节块
// free_list[2]  → 管理 24 字节块
// ...
// free_list[15] → 管理 128 字节块（每次递增 8 字节）

// 工作机制：
// 1. 容器需要 n 字节 → 向上调整为 8 的倍数 → 查对应链表
// 2. 链表有可用块 → 直接拿（纯指针操作，极快，无 cookie）
// 3. 链表为空 → 用 malloc 一次性申请一大块，切成 n 个小块串进链表
// 4. 容器释放内存 → 小块归还到链表头部（不是还给 OS）
```

**核心收益**：小块内存**没有 cookie 开销**；减少 `malloc` 调用次数；降低内存碎片。

> GCC 4.9 默认分配器回到了 `new_allocator`（即直接调 `::operator new`）。原来的 `alloc` 变成了 `__gnu_cxx::__pool_alloc`，需要显式指定。理解它的设计思想比记住哪个版本在用更重要。

### 🔍 三、迭代器与 Traits 编程技法

这是 STL 泛型编程**最精巧的设计**——算法通过迭代器操作容器，需要知道迭代器的属性，但**原生指针不是 class**，无法 typedef。Traits 就是为此而生的"萃取机"。

#### 迭代器必须提供的五种关联类型

| 类型 | 含义 | 用途 |
| --- | --- | --- |
| `value_type` | 迭代器所指对象的类型 | 算法需要知道"在操作什么类型" |
| `pointer` | 指针类型 |  |
| `reference` | 引用类型 |  |
| `difference_type` | 两个迭代器之间的距离类型 | `ptrdiff_t` |
| `iterator_category` | 迭代器类别（最重要的是这个） | 决定算法走哪条路径 |

#### Iterator Traits 的实现

```
// ===== 泛化版本：接收 class iterator =====
template <class Iterator>
struct iterator_traits {
    typedef typename Iterator::value_type        value_type;
    typedef typename Iterator::pointer           pointer;
    typedef typename Iterator::reference         reference;
    typedef typename Iterator::difference_type   difference_type;
    typedef typename Iterator::iterator_category  iterator_category;
};

// ===== 偏特化版本1：接收原生指针 T* =====
template <class T>
struct iterator_traits<T*> {
    typedef random_access_iterator_tag iterator_category;
    typedef T                          value_type;
    typedef ptrdiff_t                  difference_type;
    typedef T*                         pointer;
    typedef T&                         reference;
};

// ===== 偏特化版本2：接收 const T* =====
template <class T>
struct iterator_traits<const T*> {
    typedef random_access_iterator_tag iterator_category;
    typedef T                          value_type;  // ← 注意：是 T，不是 const T！
    typedef ptrdiff_t                  difference_type;
    typedef const T*                   pointer;
    typedef const T&                   reference;
};
```

**关键思想**：算法永远通过 `iterator_traits<I>::value_type` 来获取类型，而不是直接 `I::value_type`。当 `I` 是 `T*` 时，偏特化版本生效，返回正确的类型——**原生指针也能被"萃取"**。

#### 迭代器分类与继承体系

```
struct input_iterator_tag {};                    // 只读，单次遍历
struct output_iterator_tag {};                   // 只写，单次遍历
struct forward_iterator_tag       : public input_iterator_tag {};         // 可读写，可多次遍历
struct bidirectional_iterator_tag : public forward_iterator_tag {};       // 可 ++ 和 --
struct random_access_iterator_tag : public bidirectional_iterator_tag {}; // 可 +n, -n, []
```

| 迭代器类别 | 能力 | 对应容器 |
| --- | --- | --- |
| Input | 只读，++，== / != | `istream_iterator` |
| Forward | ++，可多次遍历 | `forward_list`, 哈希容器 |
| Bidirectional | ++ 和 -- | `list`, `set`, `map` |
| Random Access | +n, -n, \[\], <, > | `vector`, `array`, `deque` |

#### Tag Dispatch：编译期多态

不同迭代器走不同算法路径——这一切在**编译期**决定，**零运行时开销**：

```
// advance 算法：将迭代器前进 n 步
template <class InputIterator, class Distance>
void advance(InputIterator& i, Distance n) {
    __advance(i, n, iterator_traits<InputIterator>::iterator_category());
}
// ↑ 第三个参数是一个临时对象，用于触发重载决议

// 随机访问版本：O(1) —— i += n 直接跳
template <class RandomAccessIterator, class Distance>
void __advance(RandomAccessIterator& i, Distance n,
               random_access_iterator_tag) {
    i += n;  // 指针算术，一条 CPU 指令
}

// 通用版本：O(n) —— 一步一步走
template <class InputIterator, class Distance>
void __advance(InputIterator& i, Distance n,
               input_iterator_tag) {
    while (n--) ++i;  // 循环 n 次
}
```

如果某类迭代器没有专门版本，会**通过继承自动使用父类的实现**——比如 `bidirectional_iterator_tag` 如果没有专门的 `__advance`，就自动用 `forward_iterator_tag` → `input_iterator_tag` 的版本。

### 📐 四、序列式容器深度剖析

#### 1\. vector —— 动态数组

**数据结构**：只有**三个指针**（12 字节 on 32-bit）：

```
template <class T, class Alloc = alloc>
class vector {
protected:
    iterator start;           // 指向当前使用空间的起始
    iterator finish;          // 指向当前使用空间的末尾（= size()）
    iterator end_of_storage;  // 指向整块连续空间的末尾（= capacity()）
};
```

**扩容机制**——`push_back` 时空间不足：

1.  以**原大小的 2 倍**重新分配一块更大的连续内存
2.  将旧数据**拷贝/移动**到新空间
3.  释放旧空间
4.  **所有旧迭代器、指针、引用全部失效**

如果初始大小为 0，则先分配 1 个元素的空间。很多实现使用 **1.5 倍**而非 2 倍（GCC 用 2 倍，MSVC 用 1.5 倍），是为了**让之前释放的内存块有机会被复用**。

```
// vector 内部 push_back 的核心逻辑
void push_back(const T& x) {
    if (finish != end_of_storage) {
        construct(finish, x);   // 还有空间，直接构造
        ++finish;
    } else {
        insert_aux(end(), x);   // 空间不足 → 扩容 → 拷贝 → 插入
    }
}
```

> vector 迭代器就是普通指针 `T*`，属于 `random_access_iterator_tag`。这意味对 vector 使用 `advance()` 是 O(1) 的。

#### 2\. list —— 双向环状链表

**节点结构**：每个节点包含**两个指针 + 数据**：

```
template <class T>
struct __list_node {
    __list_node* prev;   // 前驱指针
    __list_node* next;   // 后继指针
    T data;              // 用户数据
};
```

**list 的结构**：有一个**哨兵节点（空节点）**，形成环状双向链表。这保证了以下性质：

- `end()` 返回的就是哨兵节点——它不存数据，只用来标记边界
- **任意位置插入/删除都是 O(1)**——只修改指针，不移动数据
- 插入/删除**不会使任何迭代器失效**

```
// list 迭代器的核心操作
// operator++: node = (link_type)((*node).next);
// operator--: node = (link_type)((*node).prev);

// 插入操作：在 position 之前插入
iterator insert(iterator position, const T& x) {
    link_type tmp = create_node(x);
    tmp->next = position.node;          // 新节点 → 后继
    tmp->prev = position.node->prev;   // 新节点 → 前驱
    position.node->prev->next = tmp;   // 前驱的 next → 新节点
    position.node->prev = tmp;         // 后继的 prev → 新节点
    return iterator(tmp);
}
```

> list 的迭代器是 `bidirectional_iterator_tag`——支持 ++ 和 --，但**不支持 +n 或 \[\]**。因此对它调用 `std::sort()` 会**编译失败**（sort 需要 Random Access）。list 有自己的 `sort()` 成员函数。

#### 3\. deque —— 分段连续双端队列

deque 是 STL 中**设计最复杂的容器**——"逻辑上连续，事实上分段"。它通过**中控器（map）**将多个独立缓冲区串成一个逻辑上的连续空间。

```
// 中控器：一个 T**，指向一个指针数组，数组中的每个指针指向一个缓冲区
typedef T** map_pointer;
map_pointer map;       // 指向指针数组
size_type map_size;    // 指针数组的大小

// 每个缓冲区（buffer）大小：元素 < 512 字节时存 512/sizeof(T) 个，否则存 1 个
```

**迭代器**——deque 的迭代器是 STL 中最复杂的：

```
struct __deque_iterator {
    T*              cur;    // 指向当前元素
    T*              first;  // 当前缓冲区的起始位置
    T*              last;   // 当前缓冲区的末尾位置（哨兵）
    map_pointer     node;   // 指向中控器中"当前缓冲区对应的那个指针"
};  // 随机访问迭代器！
```

**operator++ 如何跨越缓冲区边界**：

```
self& operator++() {
    ++cur;
    if (cur == last) {          // 走到当前缓冲区的尽头了
        set_node(node + 1);     // 跳到中控器的下一个槽（下一个缓冲区）
        cur = first;            // cur 指向新缓冲区的第一个元素
    }
    return *this;
}
```

**operator+=n 跨越多个缓冲区**：

```
self& operator+=(difference_type n) {
    difference_type offset = n + (cur - first);  // 在整段逻辑空间中的偏移
    if (offset >= 0 && offset < buffer_size()) {
        cur += n;               // 还在同一个 buffer 内
    } else {
        difference_type node_offset = offset / buffer_size();
        set_node(node + node_offset);              // 跳到目标缓冲区
        cur = first + (offset - node_offset * buffer_size());  // 缓冲区内定位
    }
    return *this;
}
```

> deque 的迭代器是 `random_access_iterator_tag`——支持 +n、-n、\[\]，但每次操作都要判断是否跨越缓冲区边界，所以**比 vector 的随机访问慢**。

#### 4\. 三大序列容器对比

|  | vector | list | deque |
| --- | --- | --- | --- |
| 底层结构 | 连续数组 | 环状双向链表 | 分段连续（map + buffer） |
| 迭代器 | `T*` | `__list_iterator` | `__deque_iterator` |
| 迭代器类别 | Random Access | Bidirectional | Random Access |
| 头部插入/删除 | O(n) | O(1) | O(1) |
| 尾部插入/删除 | O(1) 均摊 | O(1) | O(1) |
| 中间插入/删除 | O(n) | O(1) | O(n)（选移动少的一边） |
| 随机访问 \[\] | O(1) | ❌ 不支持 | O(1)（但比 vector 慢） |
| 扩容方式 | 整体搬迁（2x/1.5x） | 逐个节点申请 | 新增缓冲区 |
| 迭代器失效 | 扩容后全部失效 | 不失效（除非删该节点） | push 时可能 map 重分配 |

### 🌳 五、关联式容器

#### 有序关联容器（底层：红黑树）

`set` / `map` / `multiset` / `multimap` 底层都是**红黑树（RB-tree）**：

- **自平衡二叉搜索树**，保证树的高度不超过 `2 × log₂(n+1)`
- 查找、插入、删除都是 **O(log n)**
- 中序遍历即得**排序序列**
- `set` 的 key 即 value；`map` 的 value 是 `pair<const Key, T>`

```
// map 的 value_type
typedef pair<const Key, T> value_type;
// Key 是 const ——你不能通过迭代器修改 key！这会破坏红黑树的有序性
```

#### 无序关联容器（底层：哈希表）

`unordered_set` / `unordered_map` 底层是**哈希表（Separate Chaining）**：

- 数组（buckets）+ 链表（同一个 bucket 内的元素串成链表）
- 查找/插入/删除：**O(1) 平均**，O(n) 最坏（哈希碰撞严重时）
- 元素**无序**——遍历顺序取决于哈希值在 buckets 中的分布
- rehashing：元素数量超过 `max_load_factor() * bucket_count()` 时自动扩容

### 🔌 六、容器适配器（Adapters）

适配器不是真正的容器——它们**内含一个容器**，通过限制接口来实现特定的数据结构行为：

```
// stack —— 后进先出 (LIFO)
template <class T, class Sequence = deque<T>>
class stack {
protected:
    Sequence c;  // 内含一个 deque
public:
    void push(const T& x) { c.push_back(x); }
    void pop()             { c.pop_back(); }
    T& top()              { return c.back(); }
    bool empty() const     { return c.empty(); }
    // 注意：没有 begin()/end() —— 栈不允许遍历！
};

// queue —— 先进先出 (FIFO)
template <class T, class Sequence = deque<T>>
class queue {
protected:
    Sequence c;
public:
    void push(const T& x) { c.push_back(x); }
    void pop()             { c.pop_front(); }   // queue 用 pop_front！
    T& front()            { return c.front(); }
    T& back()             { return c.back(); }
};
```

| 适配器 | 默认底层 | 可用底层 | 概念 |
| --- | --- | --- | --- |
| `stack` | deque | deque / list / vector | LIFO 后进先出 |
| `queue` | deque | deque / list | FIFO 先进先出 |
| `priority_queue` | vector | vector / deque | 最大元素优先出队（堆） |

> queue 不能用 vector 做底层——因为 vector 没有 `pop_front()`。stack 可以用 vector。它们都**不提供迭代器**——这是刻意的设计，保护了栈和队列的**行为语义**不被破坏。

### ⚙️ 七、算法

STL 算法的设计哲学：**算法通过迭代器操作数据，不知道容器的存在**。所有算法使用**前闭后开区间** `[first, last)`。

```
#include <algorithm>
#include <numeric>

std::vector<int> v = {5, 2, 8, 1, 9};

// ===== 排序 =====
std::sort(v.begin(), v.end());                     // 升序：{1,2,5,8,9}
std::sort(v.begin(), v.end(), std::greater<>());   // 降序
std::stable_sort(v.begin(), v.end());              // 稳定排序
std::partial_sort(v.begin(), v.begin()+3, v.end());// 只排前 3 小

// ===== 查找 =====
auto it = std::find(v.begin(), v.end(), 5);        // 线性查找 O(n)
bool has = std::binary_search(v.begin(), v.end(), 5); // 二分查找 O(log n)，须已排序
auto lb = std::lower_bound(v.begin(), v.end(), 5); // 第一个 ≥5 的位置

// ===== 变换 =====
std::transform(v.begin(), v.end(), v.begin(),
               [](int x) { return x * 2; });       // 每个元素 *2

// ===== 过滤/删除 =====  （注意：算法不改变容器大小，须配合 erase）
auto newEnd = std::remove_if(v.begin(), v.end(),
                             [](int x) { return x < 3; });
v.erase(newEnd, v.end());                          // 真正删除！这被称为 erase-remove idiom

// ===== 统计 =====
int sum  = std::accumulate(v.begin(), v.end(), 0);       // 累加
int cnt  = std::count_if(v.begin(), v.end(),
                         [](int x) { return x > 5; });   // 计数

// ===== 遍历 =====
std::for_each(v.begin(), v.end(), [](int& x) { x += 1; }); // 每个元素 +1

// ===== 最大/最小 =====
auto maxIt = std::max_element(v.begin(), v.end());
auto minIt = std::min_element(v.begin(), v.end());
```

> 核心思想：算法和容器**各自独立**，通过迭代器胶合。算法不知道容器是谁，只知道迭代器能做什么。这保证了**代码复用度最大化**——一个 `find` 在所有容器上都能用。

#### 📝 面试高频题

<details class="iq">
<summary>STL各种容器的底层实现？</summary>

（1）**vector**，底层是一块具有连续内存的数组，vector的核心在于其长度自动可变。vector的数据结构主要由三个迭代器(指针)来完成：指向首元素的start，指向尾元素的finish和指向内存末端的end\_of\_storage。vector的扩容机制是：当目前可用的空间不足时，分配目前空间的两倍或者目前空间加上所需的新空间大小（取较大值），容量的扩张必须经过"重新配置、元素移动、释放原空间"等过程。

（2）**list**，底层是一个循环双向链表，链表结点和链表分开独立定义的，结点包含pre、next指针和data数据。

（3）**deque**，双向队列，由分段连续空间构成，每段连续空间是一个缓冲区，由一个中控器来控制。它必须维护一个map指针（中控器指针），还要维护start和finish两个迭代器，指向第一个缓冲区和最后一个缓冲区。deque可以在前端或后端进行扩容，这些指针和迭代器用来控制分段缓冲区之间的跳转。

（4）**stack和queue**，栈和队列。它们都是由deque作为底层容器实现的，它们是一种容器配接器，修改了deque的接口，具有自己独特的性质（此二者也可以用list作为底层实现）；stack是deque封住了头端的开口，先进后出，queue是deque封住了尾端的开口，先进先出。

（5）**priority\_queue**，优先队列。是由以vector作为底层容器，以heap作为处理规则，heap的本质是一个完全二叉树。

（6）**set和map**。底层都是由红黑树实现的。红黑树是一种二叉搜索树，但是它多了一个颜色的属性。红黑树的性质如下：1）每个结点非红即黑；2）根节点是黑的；3）如果一个结点是红色的，那么它的子节点就是黑色的；4）任一结点到树尾端（NULL）的路径上含有的黑色结点个数必须相同。通过以上定义的限制，红黑树确保没有一条路径会比其他路径多出两倍以上；因此，红黑树是一种弱平衡二叉树，相对于严格要求平衡的平衡二叉树来说，它的旋转次数少，所以对于插入、删除操作较多的情况下，通常使用红黑树。

**补充：平衡二叉树(AVL)和红黑树的区别**：AVL树是高度平衡的，频繁的插入和删除会引起频繁的rebalance（旋转操作），导致效率下降；红黑树不是高度平衡的，算是一种折中，插入最多两次旋转，删除最多三次旋转。

</details>

<details class="iq">
<summary>STL容器时间复杂度对比？</summary>

（1）**vector**，支持随机访问(通过下标），时间复杂度是O(1)；如果是无序vector查找的时间复杂度是O(n)，如果是有序vector，采用二分查找则是O(log n)；对于插入操作，在尾部插入最快，中部次之，头部最慢，删除同理。vector占用的内存较大，由于二倍扩容机制可能会导致内存的浪费，内存不足时扩容的拷贝也会造成较大性能开销；

（2）**list**由于底层是链表，不支持随机访问，只能通过扫描的方式查找，复杂度为O(n)，但是插入和删除的速度快，只需要调整指针的指向。（有一种说法是链表每次插入和删除都需要分配和释放内存，会造成较大的性能开销，所以如果频繁地插入和删除，list性能并不好，但很多地方都说list插入删除性能好）；list不会造成内存的浪费，占用内存较小；

（3）**deque**支持随机访问，但性能比vector要低；支持双端扩容，因此在头部和尾部插入和删除元素很快，为O(1)，但是在中间插入和删除元素很慢；

（4）**set和map**，底层基于红黑树实现，增删查改的时间复杂度近似O(log n)，红黑树又是基于链表实现，因此占用内存较小；

（5）**unordered\_set和unordered\_map**，底层是基于哈希表实现的，是无序的。理论上增删查改的时间复杂度是O(1)（最差时间复杂度O(n)），实际上数据的分布是否均匀会极大影响容器的性能。

</details>

<details class="iq">
<summary>SGI STL 次级分配器原理？</summary>

为了提升内存管理的效率，减少申请小内存造成的内存碎片问题，SGI STL采用了**两级配置器**，当分配的空间大小超过128B时，会使用第一级空间配置器，直接使用malloc()、realloc()、free()函数进行内存空间的分配和释放。当分配的空间大小小于128B时，将使用第二级空间配置器，采用了**内存池技术**，通过空闲链表来管理内存。

**次级配置器的内存池管理技术**：每次配置一大块内存，并维护对应的自由链表(free list)。若下次再有相同大小的内存配置，就直接从自由链表中拔出。如果客户端释还小额区块，就由配置器回收到自由链表中；配置器共要维护16个自由链表，存放在一个数组里，分别管理大小为8-128B不等的内存块。分配空间的时候，首先根据所需空间的大小（调整为8B的倍数）找到对应的自由链表中相应大小的链表，并从链表中拔出第一个可用的区块；回收的时候也是一样的步骤，先找到对应的自由链表，并插到第一个区块的位置。

**优势**：避免内存碎片(这里应该指的是外部碎片)，不需要频繁从用户态切换到内核态，性能高效；**劣势**：仍然会造成一定的内存浪费，比如申请120B就必须分配128B（内部碎片）。

</details>

<details class="iq">
<summary>push_back vs emplace_back？</summary>

emplace/emplace\_back函数使用传递来的参数直接在容器管理的内存空间中**构造元素**（只调用了构造函数）；push\_back会创建一个**局部临时对象**，并将其压入容器中（可能调用拷贝构造函数或移动构造函数）。因此emplace\_back更高效，少了一次临时对象的构造和移动/拷贝。

</details>

<details class="iq">
<summary>STL sort 用到了哪种算法？</summary>

使用**快速排序、插入排序和堆排序**三种算法的混合。当数据量很大的时候用快排，划分区段比较小的时候用插入排序，当划分有导致最坏情况的倾向的时候使用堆排序。

</details>

<details class="iq">
<summary>哈希表长度为什么是质数？如何处理冲突？</summary>

**为什么用质数**：降低冲突概率，使哈希后的数据分布更均匀；合数可能导致数据集中分布到某一点。

**处理冲突**：开放定址法（线性探测、平方探测）和拉链法。

**删除**：线性探测不会真正删元素，只做标记，否则后续查找会因为"空洞"而误判不存在。

</details>

<details class="iq">
<summary>各种排序算法的原理和时间复杂度？</summary>

（1）**快排**：一轮划分，选择一个基准值，小于该基准值的元素放到左边，大于的放在右边，此时该基准值在整个序列中的位置就确定了，接着递归地对左边子序列和右边子序列进行划分。时间复杂度O(nlogn)，最坏的时间复杂度是O(n²)；

（2）**堆排序**：利用完全二叉树性质构造的一个一维数组，用数组下标代表结点，则一个结点的左孩子下标为2i+1，右孩子为2i+2，一个结点的父节点为(i-1)/2。堆排序的思想就是，构造一个最大堆或者最小堆，以最大堆为例，那么最大的值就是根节点，把这个最大值和最后一个结点交换，然后在从前n-1个结点中构造一个最大堆，再重复上述的操作，即每次将现有序列的最大值放在现有数组的最后一位，最后就会形成一个有序数组；求升序用最大堆，降序用最小堆。时间复杂度O(nlogn)；

（3）**冒泡排序**：从前往后两两比较，逆序则交换，不断重复直到有序；时间复杂度O(n²），最好情况O(n)；

（4）**插入排序**，类似打牌，从第二个元素开始，把每个元素插入前面有序的序列中；时间复杂度O(n²），最好情况O(n)；

（5）**选择排序**，每次选择待排序列中的最小值和未排序列中的首元素交换；时间复杂度O(n²）；

（6）**归并排序**，将整个序列划分成最小的>=2的等长序列，排序后再合并，再排序再合并，最后合成一个完整序列。时间复杂度O(nlogn)；

（7）**希尔排序**，是插入排序的改进版，取一个步长划分为多个子序列进行排序，再合并(如135一个序列，246一个序列），时间复杂度O(n^1.3)，最好O(n)，最坏O(n²)；

（8）**桶排序**，将数组分到有限数量的桶里。每个桶再个别排序，最后依次把各个桶中的记录列出来即得到有序序列。桶排序的平均时间复杂度为线性的O(N+C)，其中C=N\*(logN-logM)，M为桶的数量。最好的情况下为O(N)。

</details>

<details class="iq">
<summary>求序列前K个最大/最小的数？</summary>

**方法1-快排**：每轮划分后基准值位置=P，若P=K则0~P即前K小。P>K去左边找，P

**方法2-堆**：求前K小用最大顶堆（大小为K），求前K大用最小顶堆。先将K个数入堆，之后每个数与堆顶比较：若比堆顶小(K小)则替换堆顶并调整。遍历完后堆中即结果。O(nlogK)。

</details>

<details class="iq">
<summary>Remove_If 算法的原理？</summary>

使用双指针：先找到第一个符合条件的元素位置，然后从此位置开始，往后扫描**不符合**条件的元素，逐个覆盖到该位置及之后。用指针指向要安插的位置，步进。时间复杂度O(n)，保持相对顺序。

注意：remove\_if不改变容器大小，需配合erase使用（erase-remove idiom）。

</details>

<details class="iq">
<summary>如何用栈实现队列？</summary>

使用两个栈A和B。入队时压入A；出队时若B为空，将A中所有元素弹出并压入B（反转顺序），然后从B弹出栈顶；若B非空直接弹出。这样先进A的元素先进入B的栈顶→先出。

</details>

<details class="iq">
<summary>如何判断链表是否有环？</summary>

**快慢指针法**：两个指针，快指针每次走两步，慢指针每次走一步。如果链表有环，快慢指针最终会在环内相遇；如果快指针走到nullptr则无环。时间O(n)，空间O(1)。

</details>

<span id="cpp-modern"></span>

## 🚀 现代 C++ 特性 <a href="#ue-modern" class="ue-link-tag">UE5 现代 C++</a>

以下特性从 C++11 开始引入，极大地改变了 C++ 的编程范式。

### 移动语义（Move Semantics）

移动语义是 C++11 **最重要的新增特性**。它解决了"拷贝大对象很昂贵，但拷贝完了原对象就不要了"的问题：

```
std::string s1 = "hello world this is a very long string";
std::string s2 = std::move(s1);  // 移动：s1 的内容被"转移"到 s2
// s1 现在为空，s2 拥有原来的字符串——没有发生任何内存分配或拷贝！

// 原理：通过右值引用 T&& 和移动构造函数
class Buffer {
    char* data;
    size_t size;
public:
    // 移动构造：偷走别人的资源
    Buffer(Buffer&& other) noexcept
        : data(other.data), size(other.size) {
        other.data = nullptr;   // 把原对象置为空
        other.size = 0;
    }
};
```

**核心理解**：左值（有名字、能取地址的）→ 拷贝；右值（临时的、即将销毁的）→ 移动。

### auto 类型推导

```
auto i = 42;                     // int
auto f = 3.14f;                  // float
auto it = myMap.begin();         // std::map<K,V>::iterator —— 不用写又臭又长的类型名
auto result = ComputeSomething(); // 类型变了自动适应

// 配合范围 for
for (auto& item : vec) { /* 修改元素 */ }
for (const auto& item : vec) { /* 只读遍历 */ }
```

### 范围 for 循环

```
std::vector<int> v = {1, 2, 3, 4, 5};
for (int x : v)        // 值拷贝遍历
for (int& x : v)       // 引用遍历（可以修改）
for (const int& x : v) // 只读引用遍历（推荐默认）
```

### 其他重要特性速览

| 特性 | 版本 | 说明 |
| --- | --- | --- |
| `nullptr` | C++11 | 空指针，替代 `NULL` 和 `0`（有类型安全） |
| `override` | C++11 | 显式标记覆写，编译器检查是否正确覆写了基类虚函数 |
| `final` | C++11 | 禁止类被继承 / 禁止虚函数被进一步覆写 |
| `= default` | C++11 | 显式要求编译器生成默认实现 |
| `= delete` | C++11 | 显式禁止（如禁止拷贝构造） |
| `enum class` | C++11 | 强类型枚举，不隐式转 int，不污染外部作用域 |
| `std::optional<T>` | C++17 | 可能包含值也可能不包含的类型 |
| `std::variant<T...>` | C++17 | 类型安全的 union |
| 结构化绑定 | C++17 | `auto [x, y] = GetPoint();` |
| Concepts | C++20 | 约束模板参数，编译期检查，更好的错误信息 |

#### 📝 面试高频题

<details class="iq">
<summary>C++11 有哪些新特性？</summary>

（1）**auto关键字**，可以自动推断出变量的类型；

（2）**nullptr**来代替NULL，可以避免重载时出现的问题（一个是int，一个是void\*）；

（3）**智能指针**，shared\_ptr、unique\_ptr和weak\_ptr，对内存进行管理；

（4）**右值引用**，基于右值引用可以实现移动语义和完美转发，消除两个对象交互时不必要的对象拷贝，节省运算存储资源，提高效率；

（5）**lambda表达式**，可以理解为一个匿名的内联函数。

**不足之处**：没有GC（垃圾回收机制）、没有反射机制等。

</details>

<details class="iq">
<summary>右值引用和移动语义的关系？</summary>

右值引用(&&)是为了**支持移动操作**而引入的。它只能绑定到即将销毁的对象，因此可以安全地"偷走"其资源。

std::move()将一个左值**强制转换为右值引用**，使你能够对左值使用移动语义。本质上是一个cast，不实际移动任何数据。

</details>

<details class="iq">
<summary>vector 如何手动释放内存？</summary>

比如有一个`vector<int> nums`，比较hack的一种方式是`nums = {}`，这样既可以清空元素还会释放内存（从一个大佬身上学来的）；规范的做法是，`vector<int>().swap(nums)`或者`nums.swap(vector<int>())`。

注意：`clear()`只清空元素但**不释放**已分配的内存容量。

</details>

#### 📝 面试高频题

<details class="iq">
<summary>单例模式是什么？如何实现？ ⭐⭐</summary>

单例模式保证全局只有**唯一一个自行创建的实例对象**，并由单例类提供获取这个唯一实例的接口。主要有两种实现方法：

1）**懒汉式**，用到的时候才会加载，线程不安全，需要加锁；

2）**饿汉式**，在main函数开始的时候即创建对象，线程安全；

C++11标准之后的最佳选择是**Meyers' Singleton**（属于懒汉式），它利用了局部静态变量在第一次使用时才初始化的特性，并且由于C++11标准解决了局部静态变量的线程安全问题，使得它成为当前最简洁也最高效的实现方式。

</details>

<details class="iq">
<summary>工厂模式是什么？有哪几种？</summary>

该模式用来封装和管理类的创建，终极目的是为了**解耦**，实现创建者和调用者的分离。工厂模式分为三种：

1）**简单工厂**，一个工厂生产多种产品，要指定产品的名字进行生产；

2）**普通工厂**，将产品生产分配给多个工厂，但是每个工厂只生产一种产品；

3）**抽象工厂**，将产品生产分配给多个工厂，每个工厂可以生产多种产品。

</details>

<span id="cs-os"></span>

## 💻 操作系统

### 进程和线程的区别？

**参考：《现代操作系统》、面经总结**

1.  **进程**是运行时的程序，是系统进行**资源分配和调度**的基本单位，实现了系统的并发
2.  **线程**是进程的子单位（轻量级进程），是**CPU分配和调度**的基本单位，实现了进程内部的并发
3.  一个程序至少一个进程，一个进程至少一个线程，线程**依赖于进程**而存在
4.  进程拥有**独立**的内存空间，线程**共享**进程的内存空间，不占用额外资源
5.  线程的优势：信息共享和通讯方便，不需要资源切换等

### 死锁

**什么是死锁？**多个进程并发执行，各自占有一定资源的同时希望获得其他进程的资源，但大家都不释放自己的资源，导致**相互阻塞、循环等待**，进程无法推进。

**四个必要条件：**

1.  **互斥条件**——一个资源每次只能被一个进程使用
2.  **请求并保持**——因请求资源而阻塞时，对已获得的资源保持不放
3.  **不剥夺条件**——未使用完之前不能被剥夺，只能自己释放
4.  **循环等待**——若干进程之间形成头尾相接的循环等待资源关系

**防止方法：**

- **死锁预防**：打破四个条件之一
- **死锁避免**：银行家算法——分配前计算是否会导致不安全状态，若会则不分配
- **死锁检测和解除**：抢占资源或终止进程

### 虚拟内存

通过**分页管理机制**实现。将程序逻辑地址划分为固定大小的**页（Page）**，物理内存划分为同样大小的**帧（Frame）**。程序加载时任意页可放入任意帧，帧不必连续。虚拟内存允许程序**不必将所有页都放入内存**——部分页在外存，引用到不在内存的页时产生**缺页中断**，从外存调入——逻辑上内存得到扩充。

### 内存碎片

采用分区式存储管理的系统，在储存分配过程中产生的、不能供用户作业使用的**主存里的小分区**称为"内存碎片"。

- **内部碎片**：分配给进程的内存块中未被使用的部分（如分配128B实际只用120B）
- **外部碎片**：未分配但太小而无法分配给任何进程的零散空间

内存碎片**只存在于虚拟内存**上。

#### 📝 面试高频题

<details class="iq">
<summary>进程和线程的区别？</summary>

1) 进程是资源分配和调度的基本单位；线程是CPU分配和调度的基本单位

2) 一个程序至少一个进程，一个进程至少一个线程，线程依赖进程存在

3) 进程拥有独立内存空间，线程共享进程内存空间

4) 线程间信息共享和通讯更方便，不需要资源切换

5) 进程是重量级，线程是轻量级

</details>

<details class="iq">
<summary>死锁的条件和防止方法？</summary>

**死锁**：多进程各自占资源并等待对方资源，形成循环等待。

**四个条件**：互斥、请求并保持、不剥夺、循环等待。

**防止**：预防（打破条件）、避免（银行家算法：分配前计算安全性，不安全则不分配）、检测和解除（抢占或终止）。

</details>

<details class="iq">
<summary>虚拟内存是什么？</summary>

分页管理：逻辑地址→页，物理内存→帧，页可放入任意帧（不连续）。

虚拟内存：不必全部页放入内存，部分在外存。访问不在内存的页→缺页中断→从外存调入→逻辑上内存被扩充。

</details>

<details class="iq">
<summary>什么是内存碎片？</summary>

**内部碎片**：已分配但未使用的部分（如申请120B给128B）

**外部碎片**：未分配但太小无法分配给任何进程的零散空间

内存碎片**只存在于虚拟内存**上。

</details>

<span id="cs-arch"></span>

## 🔧 计算机组成

### 缓存（Cache）

**什么是Cache？**CPU的高速缓冲存储器，是一种用于**减少处理器访问内存所需平均时间**的部件。由于CPU计算速度远大于从内存取数据的速度，Cache作为中间缓冲，CPU通过读写缓存来获取操作数，结果也通过缓存写入内存。

### 如何提高缓存命中率？

- 注意程序的**局部性原理**：遍历数组时按照内存顺序访问
- 充分利用CPU**分支预测**功能，将预测的指令放到缓存中执行
- 缓存的**容量和块长**是影响效率的重要因素

**缓存不是最快的**——**寄存器**比缓存更快。

### 缓存一致性

在多核CPU中，每个核有自己的缓存，当两个核**独自修改**缓存中的数据时，可能造成**数据不一致**的问题。解决方法：1) 总线加锁；2) **缓存一致性协议**（如MESI协议）。

### 缓存块

如果缓存**没有命中**（即读取一个数据不在缓存中），不仅需要把该字从主存中取出，还需要从主存中将该字所在的**整个字块一次调入缓存**中。**缓存线（块）的长度是 64B**。

#### 📝 面试高频题

<details class="iq">
<summary>什么是Cache？为什么需要？</summary>

CPU高速缓冲存储器，减少CPU访问内存的平均时间。CPU太快，内存太慢，Cache弥补速度差。

**提高命中率**：利用局部性原理按序访问、利用分支预测、增大缓存容量和块长。

**不是最快**：寄存器比缓存更快。

</details>

<details class="iq">
<summary>什么是缓存一致性？</summary>

多核CPU各自有缓存，独立修改同一数据时产生不一致。解决：总线加锁或缓存一致性协议（如MESI）。

</details>

<details class="iq">
<summary>缓存块大小？读内存是读多少取多少吗？</summary>

**缓存线(块)长度是64B**。缓存未命中时，不仅取所需数据，而是将该数据所在的**整个字块一次调入**缓存中（利用了空间局部性）。

</details>

<span id="cs-net"></span>

## 🌐 计算机网络

### TCP 和 UDP 的区别

|  | TCP | UDP |
| --- | --- | --- |
| 全称 | 传输控制协议 | 用户数据报协议 |
| 连接 | **面向连接**（三次握手建立） | **无连接** |
| 可靠性 | **可靠**，保证数据正确到达 | **不可靠**，尽力而为，不保证送达 |
| 数据单位 | 面向**字节流** | 面向**数据报** |
| 通信模式 | 只支持**点对点** | 支持一对一、一对多、多对多 |
| 拥塞控制 | 有 | 无 |
| 适用场景 | 文件传输、网页、邮件 | 游戏实时通信、视频直播、DNS |

在游戏开发中：位置同步、实时战斗用**UDP**（低延迟，容忍丢包）；登录、交易用**TCP**（必须可靠）。

#### 📝 面试高频题

<details class="iq">
<summary>TCP和UDP的区别？</summary>

1) TCP面向连接（三次握手），UDP无连接

2) TCP可靠（保证正确到达），UDP不可靠（尽力而为）

3) TCP面向字节流，UDP面向数据报

4) TCP只支持点对点，UDP支持一对一/一对多/多对多

5) TCP有拥塞控制，UDP没有

6) 游戏位置同步用UDP（低延迟容忍丢包），登录交易用TCP（必须可靠）

</details>

<span id="ue-build"></span>

## 🔨 UE5 构建体系与 UBT

<span class="ref-tag">编译与链接</span>

C++ 的四阶段编译流水线在 UE5 中被**大规模工程化**——UBT（Unreal Build Tool）负责编排整个构建流程，在标准编译器之上加了多层抽象。

#### UBT 工作流

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│ Build.cs    │ → │ UHT 反射生成  │ → │ 标准 C++ 编译 │ → │ 链接     │
│ (模块声明)   │    │ .gen.cpp     │    │ MSVC/Clang    │    │ Linker   │
└─────────────┘    └──────────────┘    └──────────────┘    └──────────┘
  UBT 读取模块      基于宏标记生成      每个 .cpp 独立编译       最终生成
  依赖和编译选项     反射注册代码        为 .obj                .dll/.exe
```

UBT 的工作远不止"调用编译器"：它负责**模块依赖分析**、**编译选项注入**、**跨平台适配**、**第三方库链接**。每一个 `.Build.cs` 文件声明一个模块，UBT 读取所有模块后构建**依赖图**，决定编译顺序。

#### Module 系统与 Build.cs

UE5 的项目由**模块（Module）**组成——每个模块是一个独立的编译单元，对应一个 `.Build.cs`：

```
// MyProject.Build.cs
public class MyProject : ModuleRules
{
    public MyProject(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        // 公共依赖 —— 头文件会暴露给依赖本模块的其他模块
        PublicDependencyModuleNames.AddRange(new string[] {
            "Core", "CoreUObject", "Engine"
        });

        // 私有依赖 —— 只在 .cpp 内部使用，不暴露
        PrivateDependencyModuleNames.AddRange(new string[] {
            "Slate", "SlateCore", "EnhancedInput"
        });
    }
}
```

<div class="tip-card"><strong>理解：</strong><code>PublicDependencyModuleNames</code> 的依赖会<strong>传递</strong>——A 公开依赖(public引用) B，B 公开依赖 C → A 可以直接用 C。<code>PrivateDependencyModuleNames</code> 不传递。合理使用能显著缩短编译时间。</div>

#### 增量编译与 Live Coding

```
// Live Coding 工作流（开发期）：
// 1. 修改 .cpp → Ctrl+Alt+F11 → 编译差异 → Patch 到运行中的进程
// 2. 无需关闭编辑器、无需重新加载关卡 —— 比完整编译快 5~10 倍
//
// 原理：编译器只重新编译改动的翻译单元 → 生成 .patch 文件
// → 操作系统级 DLL 热替换（利用 LoadLibrary/FreeLibrary）
```

Live Coding 直接利用了**C++ 独立编译**的特性——只改一个 .cpp 就只重编那一个翻译单元，然后动态替换。但如果改了头文件（尤其被大量 .cpp include 的头），Live Coding 会退化为全量编译。

<div class="tip-card"><strong>🔗 对应 C++ 核心概念：</strong>理解 UBT 的关键在于理解<strong>翻译单元</strong>的独立性——UBT 的所有优化（PCH、Unity Build、增量编译）都建立在这个概念之上。改头文件为什么慢？因为预处理器把改动"广播"到了每一个 include 它的翻译单元。</div>

<span id="ue-uht-guard"></span>

## 📋 UHT 与宏系统

<span class="ref-tag">头文件 / 预处理器 / 防卫式声明</span>

UE5 的 **UHT（Unreal Header Tool）**在编译前会解析所有头文件生成反射代码，这个过程直接依赖防卫式声明的正确性。

<div class="tip-card"><strong>⚠️ 关键点：</strong>没有防卫式声明 → UHT 对同一个类生成<strong>两份反射注册代码</strong> → 链接错误。</div>

```
// MyActor.h（UE5 模板）
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MyActor.generated.h"   // ← 必须最后一个 include！

UCLASS()
class MYPROJECT_API AMyActor : public AActor {
    GENERATED_BODY()
};
```

`.generated.h` 必须在 include 列表末尾——UHT 在解析头文件时需要**所有依赖类型已经声明完毕**，否则反射代码会引用到不完整的类型。

#### UCLASS / USTRUCT / UENUM 宏的本质

这些宏在 **UHT 解析阶段** 被识别，在 **C++ 编译阶段** 展开为空或装饰器。它们是"给 UHT 看的标记"，不是"给编译器看的指令"：

| 宏 | UHT 看到它做什么 | C++ 编译时展开成什么 |
| --- | --- | --- |
| `UCLASS()` | 标记此类需要生成反射数据 | 编译器特定的 `__declspec` / `__attribute__` 装饰器 |
| `USTRUCT()` | 标记此结构体需要反射 | 同上（结构体版本） |
| `UENUM()` | 标记此枚举需要反射 | 展开为包含元数据的枚举包装 |
| `UFUNCTION()` | 记录函数签名，生成调用包装器 | 展开为函数装饰器 + 元数据结构 |
| `UPROPERTY()` | 记录属性类型、偏移量、元数据 | 展开为静态变量声明 + 初始化代码 |

<div class="tip-card"><strong>🔍 这对应 C++ 的哪个概念？</strong>UHT 宏就是<strong>领域特定语言（DSL）</strong>——通过 <code>#define</code> 实现。UHT 在预处理之前解析它们，本质上是一个<strong>独立的预处理器</strong>，工作在 C++ 预处理器<strong>之前</strong>。这解释了为什么 <code>.generated.h</code> 必须在最后——它依赖前面所有 <code>#include</code> 展开后的类型信息。</div>

#### GENERATED\_BODY() 源码级展开

这是连接 UHT 生成代码和你手写代码的**桥梁宏**。典型的展开包含：

```
// GENERATED_BODY() 展开后大约包含：
public:
    // 1. 静态类型信息（用于 Cast、IsA 等运行时类型识别）
    static FStaticClassRegisterCompiledInInfo StaticClassInfo;
    // 2. 返回 UClass* 的函数声明
    static UClass* GetPrivateStaticClass();
    // 3. 虚函数覆盖：返回运行时 UClass
    virtual UClass* GetClass() const override;
    // 4. 静态初始化注册器（程序启动时自动注册到反射系统）
    static const FCompiledInDefer<TClass> AutoInitialize##ClassName;
    // 5. 友元声明：允许 UHT 生成的代码访问私有成员
    friend class UClassCompiledInDefer<TClass>;
```

> **核心理解：**GENERATED\_BODY() 本质上就是**利用 C++ 静态成员变量在 main() 之前初始化的特性**，在程序启动时向全局注册表写入类型信息。这跟 C++ 中 `static` 局部变量只在第一次调用时初始化的机制如出一辙。

<span id="ue-types"></span>

## 📐 UE5 类型体系

<span class="ref-tag">变量与数据类型</span>

UE5 在标准 C++ 类型基础上建立了**跨平台定长类型系统**，确保同一份代码在不同平台上有一致的内存布局。

<div class="tip-card"><strong>💡 核心动机：</strong>标准 C++ 的 <code>int</code> 在不同平台上可能是 2 或 4 字节——这对网络同步、序列化、Shader 交互是致命的。UE5 用 <code>int32</code> 彻底消除歧义。此外，UE5 需要类型系统<strong>原生支持反射、序列化、网络复制、GC 追踪</strong>，这是 C++ 标准类型无法提供的。</div>

#### 定长基础类型

| UE5 类型 | C++ 底层 | 大小 | UE5 无符号版 |
| --- | --- | --- | --- |
| `int8` | `char` | 1 | `uint8` |
| `int16` | `short` | 2 | `uint16` |
| `int32` | `int` | 4 | `uint32` |
| `int64` | `long long` | 8 | `uint64` |
| `float` | `float` | 4 | —（UE5 浮点即标准 float） |
| `double` | `double` | 8 | —（Large World Coordinates 用） |

#### 三大字符串类型：FString / FName / FText

这组设计直接映射了 C++ 中 **字符串的不同使用场景**：

| 类型 | 底层结构 | 可变性 | 比较速度 | 适用场景 |
| --- | --- | --- | --- | --- |
| `FString` | `TArray<TCHAR>` 动态数组 | 可变 | O(n) 逐字符 | 文件路径、日志、UI 动态文本 |
| `FName` | 全局哈希表索引（32位） | **不可变** | **O(1) 指针/索引比较** | 资源名、骨骼名、Socket 名、高频标识符 |
| `FText` | 三部分组成——源字符串 + 翻译 + 本地化格式 | 不可变 | O(n) | 玩家可见文本（需翻译成多语言） |

```
// FName 的核心原理 —— 跟 C++ const 常量池的思想一脉相承
FName Name1("MyBone");   // 第一次：把 "MyBone" 哈希后存入全局 Name 表
FName Name2("MyBone");   // 第二次：哈希相同 → 直接返回同一个索引
// Name1 == Name2  →  只比较 4 字节的索引，不是比较字符串！
// 全局 Name 表在引擎生命周期内只增不减 —— 本质是一个巨大的 constexpr 池
```

<div class="tip-card"><strong>🔗 对应 C++ constexpr：</strong>FName 的设计哲学和 C++ 的 <code>constexpr</code> 字符串池、编译期常量折叠是同一个思路——把可变的东西尽量推到编译期/初始化期处理，运行期只做 O(1) 的简单比较。只初始化一次，永不修改。</div>

#### 数学类型：FVector / FRotator / FTransform

这些类型底层就是 C++ 的基础类型组合，通过**运算符重载**实现数学运算的语法糖：

```
// FVector —— 本质就是三个 float
struct FVector {
    float X, Y, Z;
    FVector operator+(const FVector& V) const;  // 对应 C++ 运算符重载
    float Dot(const FVector& V) const;           // 点积
    FVector Cross(const FVector& V) const;       // 叉积
    float Size() const;                           // 长度
    FVector GetSafeNormal() const;                // 单位向量
};

// FRotator —— Pitch(Y), Yaw(Z), Roll(X)
// FTransform —— 包含 Translation(FVector) + Rotation(FQuat) + Scale3D(FVector)
```

`FColor`（RGBA 各 1 字节，共 4 字节）vs `FLinearColor`（RGBA 各 float，共 16 字节）——这就像 C++ 中选 `char` 还是 `int`，是**精度与内存的权衡**。

<span id="ue-pointer"></span>

## 👉 指针与智能指针

<span class="ref-tag">指针与引用</span>

UE5 中有**两套并行的指针体系**：一套是 UObject 世界中的指针（被 GC 管理），另一套是非 UObject 的通用指针体系（对应 C++ 智能指针）。理解它们的区别至关重要。

#### 第一套：UObject 指针——裸指针 + GC 追踪

所有 `UObject*` 都是**裸指针**，但它们被 GC 系统追踪——这是 UE5 最特殊的设计：

```
// UObject* 就是普通指针，但加了 GC 保护规则
UPROPERTY()
AActor* MyActor;  // ← UPROPERTY 标记 → GC 知道此指针引用了该对象 → 不被回收

AActor* TempActor = GetActor();  // ← 没 UPROPERTY → GC 认为没人引用 → 可能被回收！
// TempActor 在最坏情况下：你这行代码执行完后，下一秒 GC 就把它删了
```

<div class="tip-card"><strong>⚠️ 核心规则：</strong>UObject* 是否受 GC 保护，<strong>不取决于它是不是指针，而取决于它有没有 <code>UPROPERTY()</code> 标记</strong>。没有 UPROPERTY 的 UObject* 只是"观察者"——GC 随时可能回收它指向的对象。UE5.1+ 引入 <code>TObjectPtr&lt;T&gt;</code> 替代裸 UObject*，本质上是加了编译期类型检查的包装，运行时仍是裸指针。</div>

#### IsValid() vs nullptr

```
AActor* Ptr = GetSomeActor();
Ptr->Destroy();                          // 标记为待删除，但内存可能还没释放

if (Ptr != nullptr) { ... }              // ❌ 对象已被 Destroy，但指针仍非空！
if (IsValid(Ptr)) { ... }                // ✅ 检查对象是否真正可用（未被标记删除）
```

`IsValid()` 会检查 UObject 的**内部状态标记**（PendingKill、内部标志位），而不仅仅是地址是否为空。这就像 C++ 中 RAII 对象析构后资源已释放，但原始指针还在——只是 UE5 多了一层引擎级的"半死"状态。

#### 第二套：非 UObject 智能指针

对于**非 UObject 的 C++ 类**（纯 C++ 逻辑、Slate UI、第三方库），UE5 提供了对标标准库的智能指针：

| UE5 | C++ 标准 | 所有权 | 使用场景 |
| --- | --- | --- | --- |
| `TUniquePtr<T>` | `std::unique_ptr<T>` | 独占 | 工厂函数返回值、PIMPL、Slate Widget 内部成员 |
| `TSharedPtr<T>` | `std::shared_ptr<T>` | 共享（引用计数） | Slate 系统大量使用、多线程共享数据 |
| `TWeakPtr<T>` | `std::weak_ptr<T>` | 观察 | 打破循环引用、缓存引用 |
| `TSharedRef<T>` | —（UE5 特有） | 共享（保证非空） | 确定永远不为空的共享引用 |
| `TWeakObjectPtr<T>` | —（UE5 特有） | 弱引用 UObject | 跨 GC 周期安全引用 UObject |

```
// TUniquePtr —— 独占，不可拷贝，对应 unique_ptr
TUniquePtr<FMyData> Data = MakeUnique<FMyData>();
// Data2 = Data;  ← 编译错误！不能拷贝
TUniquePtr<FMyData> Data2 = MoveTemp(Data);  // Data 变为空，Data2 接管

// TSharedPtr —— 引用计数，对应 shared_ptr
TSharedPtr<FMyData> S1 = MakeShared<FMyData>();
TSharedPtr<FMyData> S2 = S1;  // 引用计数 = 2
```

> **经验法则：**UObject 派生类 → 裸指针 + `UPROPERTY()` 保护（UE5.1+ 用 `TObjectPtr`）。非 UObject 类 → `TUniquePtr` 优先，真正需要共享时用 `TSharedPtr`。这和 C++ 中 `unique_ptr` 优先的原则完全一致。

<span id="ue-delegate"></span>

## ⚡ 委托系统与函数

<span class="ref-tag">函数进阶 / InLine / Lambda</span>

#### FORCEINLINE —— 强制内联

UE5 不用 `inline`，而用 `FORCEINLINE`——标准 inline 是**建议**，编译器可忽略；`FORCEINLINE` 是**强制**——Debug 模式也会展开：

| 宏 | MSVC 底层 | GCC/Clang 底层 |
| --- | --- | --- |
| `FORCEINLINE` | `__forceinline` | `__attribute__((always_inline))` |

```
FORCEINLINE float GetHealth() const { return Health; }
FORCEINLINE FVector GetLocation() const { return Location; }
// 在性能关键路径（getter、数学运算、FVector 操作）大量使用
```

#### 委托——C++ 函数指针的工业化升级

UE5 委托系统直接建立在 C++ **函数指针 + 成员函数指针**之上，但解决了原生函数指针的三大痛点：**类型安全**、**一对多广播**、**蓝图可绑定**。

| 委托类型 | C++ 对应 | 绑定对象 | 蓝图 | 适用场景 |
| --- | --- | --- | --- | --- |
| **单播委托**
`DECLARE_DELEGATE` | 函数指针

`void(*)(Args)` | 单个函数 | ❌ | C++ 内部回调、策略模式 |
| **多播委托**

`DECLARE_MULTICAST_DELEGATE` | 函数指针列表

（观察者模式） | 多个函数 | ❌ | 事件分发、通知系统 |
| **动态单播**

`DECLARE_DYNAMIC_DELEGATE` | —（运行时反射） | 单个函数 | ✅ | 蓝图可绑定的回调 |
| **动态多播**

`DECLARE_DYNAMIC_MULTICAST_DELEGATE` | —（事件分发器） | 多个函数 | ✅ | 蓝图事件分发器（最常用） |

```
// 声明一个带参数的委托
DECLARE_DELEGATE_OneParam(FOnHealthChanged, float);    // NewHealth
DECLARE_MULTICAST_DELEGATE_TwoParams(FOnDied, AActor*, AActor*); // Victim, Killer

// 绑定（对应 C++ 的"把函数地址赋给函数指针"）
MyDelegate.BindUObject(this, &AMyActor::OnHealthChanged);
// Lambda 绑定 —— 对应 C++ 的 lambda + std::function
MyDelegate.BindLambda([](float NewHealth) { UE_LOG(LogTemp, Log, TEXT("%f"), NewHealth); });

// 执行（对应 C++ 的"通过函数指针调用函数"）
MyDelegate.ExecuteIfBound(50.0f);   // 单播：只能有一个绑定者
MyEvent.Broadcast(Killer, Victim);  // 多播：通知所有注册者
```

<div class="tip-card"><strong>🔗 对应 C++：</strong><code>BindUObject</code> 底层用的是 <strong>C++ 成员函数指针</strong> <code>(T::*FuncPtr)(Args)</code>。非动态委托本质上是<strong>类型安全的函数指针包装器</strong>，动态委托则在上层增加了 UHT 反射支持来实现蓝图绑定和序列化。</div>

#### UFUNCTION 说明符

这些标记决定了函数在蓝图、网络、GC 中的行为——本质上是用**宏元数据**标注 C++ 函数属性：

| 说明符 | 含义 |
| --- | --- |
| `BlueprintCallable` | 蓝图可调用此函数（最常见的标记） |
| `BlueprintNativeEvent` | 蓝图可覆写，C++ 提供默认实现（= 虚函数 + 蓝图可覆写） |
| `BlueprintImplementableEvent` | 纯蓝图实现，C++ 只声明不定义 |
| `Server / Client / NetMulticast` | 网络 RPC：谁调用，在哪里执行 |
| `BlueprintPure` | 蓝图纯函数（无副作用，类似 C++ const 方法） |

<span id="ue-memory"></span>

## 🧠 UObject GC 与内存管理

<span class="ref-tag">内存管理 / 智能指针 / RAII</span>

UE5 对**UObject 派生类**使用**追踪式垃圾回收（Tracing GC）**，对**非 UObject 的纯 C++ 类**使用**智能指针 + RAII**——两套体系并存，对应 C++ 内存管理的两种哲学。

#### UObject GC 机制 —— 标记-清扫（Mark-Sweep）

```
// GC 流程（定期触发，间隔可配置）：
//   Phase 1: Mark（标记）
//     GC 从 Root Set（根集）出发，遍历所有 UPROPERTY 引用
//     → 能到达的对象标记为"可达"
//     Root Set 包括：
//       - 所有 UObject（通过 AddToRoot() 手动加入）
//       - 当前加载的 Level 中的 Actor
//       - 引擎核心对象（GameInstance、World 等）
//
//   Phase 2: Sweep（清扫）
//     → 未被标记的对象 = 垃圾 → 调用 ConditionalBeginDestroy() → 释放内存
```

<div class="tip-card"><strong>🔗 对应 C++ RAII：</strong>GC 的 Mark-Sweep 跟 C++ 的手动 <code>new/delete</code> 是<strong>两种不同的内存管理哲学</strong>。但 UE5 在 UObject 析构时仍然遵循 RAII —— <code>BeginDestroy()</code> / <code>FinishDestroy()</code> 就是 UObject 的"析构函数"，在其中释放非 UObject 资源（如文件句柄、网络连接）。</div>

#### UPROPERTY —— GC 的"可见性标记"

这直接对应 C++ 中智能指针的"所有权语义"：

```
UPROPERTY()
	AActor* ImportantRef;     // "我拥有此引用"→ GC 不会回收 → 类似 shared_ptr

	AActor* WeakRef;          // "我只观察"→ GC 可能随时回收 → 类似使用悬空指针
```

GC 只关心 `UPROPERTY()` 标记的成员——它是**反射系统追踪引用关系的唯一入口**，就像 C++ 的 shared\_ptr 控制块是引用计数的唯一入口一样。

#### TWeakObjectPtr 与 TStrongObjectPtr

```
// TWeakObjectPtr —— 安全的弱引用（相当于 C++ 的 weak_ptr）
TWeakObjectPtr<AActor> WeakActor = SomeActor;
if (WeakActor.IsValid()) {
    WeakActor->DoSomething();  // 使用前检查——对象可能已被 GC 回收
}

// TStrongObjectPtr —— 强引用，阻止 GC
TStrongObjectPtr<UObject> StrongObj = LoadObject<UObject>(...);
// 只要 StrongObj 存在，对象就不会被 GC（相当于 AddToRoot 包装器）
```

#### Actor 生命周期

| 阶段 | 对应 C++ 概念 | 关键函数 |
| --- | --- | --- |
| 诞生（创建） | 构造函数 | `AActor::AActor()` / `PostInitializeComponents()` |
| 活跃（运行中） | 正常对象状态 | `BeginPlay()` → Tick循环 → ... |
| 标记待删除 | —（UE5 特有） | `Destroy()`——不通 C++ delete，只是打标记 |
| 延迟销毁 | 析构前等待 | 等 GC 下一轮清扫——可能延迟数帧 |
| 真正销毁 | 析构函数 | `BeginDestroy()` → `FinishDestroy()` → `~UObject()` |

<span id="ue-oop"></span>

## 🏛️ 对象模型与反射

<span class="ref-tag">面向对象 / 继承 / 多态 / 虚函数</span>

#### UObject 继承体系

UE5 的**所有需要反射、GC、序列化的类**都继承自 UObject。这套继承体系直接建立在 C++ 虚函数和多态之上：

```
UObject                           // 根基类：提供 GC、反射、序列化、网络复制
  ├── UActorComponent             // 组件基类（Tick、OnRegister）
  │     ├── USceneComponent       // 有 Transform 的组件
  │     └── UActorComponent ...   // 纯逻辑组件（如 UMovementComponent）
  ├── AActor                      // 可放入关卡的实体（BeginPlay、Tick、Destroy）
  │     ├── APawn                 // 可被控制的 Actor（含 Controller 引用）
  │     │     └── ACharacter      // 含 CapsuleComponent + MovementComponent
  │     └── AController           // Pawn 的控制器
  ├── UUserWidget                 // UMG UI 基类
  └── UDataAsset / UPrimaryDataAsset  // 数据资产
```

<div class="tip-card"><strong>🔗 对应 C++ 继承：</strong>这套体系就是标准 C++ 继承（<code>class A : public B</code>）+ 虚函数（<code>virtual</code>）的直接应用。每个层级都通过 <code>virtual void BeginPlay()</code> 这样的虚函数让子类覆写行为。理解 C++ 的 vtable 就能理解 UE5 的虚函数分派。</div>

#### Cast<> 与 IsA<> —— UE5 的 RTTI

UE5 不用 `dynamic_cast`（因为禁用了 C++ RTTI），而是用自己的反射系统实现更快的类型转换：

```
// Cast —— 等价于 dynamic_cast，但基于反射系统的类型比较
AActor* GenericActor = ...;
APawn* P = Cast<APawn>(GenericActor);
if (P) { /* 确实是 Pawn */ }

// IsA —— 等价于 typeid 检查
bool isCharacter = SomeActor->IsA<ACharacter>();

// Cast 的内部实现原理（简化）：
// 1. 获取对象的 UClass*（通过 GetClass() 虚函数）
// 2. 遍历继承链，看目标类型是否在链上（类似 C++ 的 type_info 继承遍历）
// 3. 匹配成功 → 返回 static_cast 后的指针
// 4. 匹配失败 → 返回 nullptr
```

#### 接口系统

```
// 声明接口（对应 C++ 纯虚类）
UINTERFACE(Blueprintable)         // UHT 生成的接口 UClass
class UMyInterface : public UInterface { GENERATED_BODY() };

class IMyInterface {              // 实际的 C++ 接口类
    GENERATED_BODY()
public:
    virtual void DoSomething() = 0;  // 纯虚函数
};

// 实现接口（相当于 C++ 的多重继承）
class AMyActor : public AActor, public IMyInterface {
    virtual void DoSomething() override { /* ... */ }
};

// 接口指针获取（不用 Cast，用特定 API）
IMyInterface* Iface = Cast<IMyInterface>(Actor);
// 内部用 IsImplementedInterface() 检查 + static_cast
```

#### CDO（Class Default Object）

每个 `UClass` 都有一个**唯一的默认对象实例**，在类注册时自动创建。它存储了**类的默认属性值**——这利用了 C++ 的静态存储期概念：

```
// CDO 创建流程：
// 1. UHT 生成的 AutoInitialize 在 main() 前运行
// 2. 调用 GetPrivateStaticClass() 注册 UClass
// 3. 引擎用 NewObject<T>() 创建唯一 CDO 实例
//    → 调用构造函数（无参）→ 用 config/ini 覆盖属性 → CDO 保存为 UClass 的成员
//
// 使用 CDO：
const AMyActor* DefaultActor = GetDefault<AMyActor>();  // 获取 CDO
float DefaultHealth = DefaultActor->Health;             // 读取默认值
```

#### 反射机制原理（总结）

UE5 的反射系统（UClass / UProperty / UFunction）构建在以下 C++ 基础之上：

- **静态成员变量** → 存储类型元数据表，main() 前初始化注册
- **虚函数** → `GetClass()` 返回运行时类型，对应 vtable 查询
- **函数指针** → UFunction 内部用成员函数指针实现动态调用
- **模板 & 宏展开** → GENERATED\_BODY() 自动生成样板反射代码
- **继承链** → UObject 作为所有反射类型的根基类，提供 `__vptr` + `UClass*`

> 纯血 C++ 提供了"砖块"（类型、继承、模板、宏、编译模型），UE5 用这些砖块砌出了反射这座"建筑"。理解砖块才能理解建筑为什么这样设计。

<span id="ue-template"></span>

## 📦 模板与泛型应用

<span class="ref-tag">模板与泛型编程</span>

UE5 大量使用 C++ 模板，但风格更接近"早期 C++ 模板"——**少用 SFINAE、多用 tag dispatch + 特化**，优先考虑编译速度和调试体验。

#### TSubclassOf<T> —— 类型安全的类引用

这是模板在 UE5 中最经典的应用——封装 `UClass*` 指针，限制它只能指向特定类型的子类：

```
// TSubclassOf 利用了模板的类型约束能力
UPROPERTY(EditAnywhere)
TSubclassOf<AActor> ActorClass;       // 在编辑器中只能选 AActor 的子类

UPROPERTY(EditAnywhere)
TSubclassOf<ACharacter> CharacterClass; // 只能选 ACharacter 及其子类

// 内部实现（简化）：
template <typename T>
class TSubclassOf {
    UClass* Class;
public:
    // 检查传入的 UClass 是否为 T 的子类（通过 IsChildOf）
    TSubclassOf(UClass* InClass) {
        if (InClass && InClass->IsChildOf(T::StaticClass())) {
            Class = InClass;
        }
    }
};
```

#### TIsDerivedFrom —— 编译期类型判断（SFINAE）

```
// 编译期判断 Derived 是否继承自 Base
template<typename Derived, typename Base>
struct TIsDerivedFrom {
    // 利用 SFINAE：如果转换失败，选择返回 false 的重载
    // 实质上利用了编译器的重载决议和 static_cast 的编译期检查
    enum { Value = __is_base_of(Base, Derived) };  // 编译器内建
};

// 应用：模板函数只接受特定类型的参数
template<typename T>
typename TEnableIf<TIsDerivedFrom<T, AActor>::Value>::Type
ProcessActor(T* Actor) { /* 只有 AActor 子类才能调这个函数 */ }
```

#### 模板在 UE5 中的常见应用场景

| 场景 | 模板用法 | 示例 |
| --- | --- | --- |
| 容器 | 类模板 | `TArray<int32>`, `TMap<FName, int32>` |
| 类型约束 | SFINAE + traits | `TSubclassOf<T>`, `TIsDerivedFrom<T,U>` |
| 算法 | 函数模板 | `Algo::Sort()`, `Algo::Find()` |
| 委托 | 可变参数模板 | `TBaseDelegate<RetType, ParamTypes...>` |
| 数学 | 数值模板参数 | `TVector<T>`, `TInterval<T>` |

> UE5 的模板风格偏保守——尽量避免复杂的模板元编程，原因很简单：**编译时间**。百万行级别的代码库中，每多一层模板递归就多几千个翻译单元的编译负担。引擎倾向于用**代码生成（UHT）**替代**模板元编程**——写宏让工具生成代码，而不是让编译器递归展开模板。

<span id="ue-containers"></span>

## 🗂️ UE5 容器 vs STL

<span class="ref-tag">STL 标准库 / 容器 / 分配器</span>

#### 为什么 UE5 不用 STL 容器？

1.  **历史原因**——UE 诞生于 1998 年，当时 STL 在不同编译器上的实现**天差地别**（性能、行为、内存布局都不一致）。跨平台一致性是第一需求。
2.  **内存控制**——STL 容器的 allocator 在 C++11 之前是**类型的一部分**（`std::vector<int, MyAlloc>` 和 `std::vector<int>` 是不同的类型！）。UE5 的分配器是**模板参数**，可自由切换。
3.  **调试体验**——UE5 容器有边界检查、内存追踪、内部状态 dump。STL 在 Debug 模式下性能极差，Release 模式下出错时信息极少。
4.  **统一序列化/网络复制**——UE5 容器原生支持 FArchive 序列化和属性复制，STL 容器需要额外包装。

#### 核心容器对照表

| UE5 容器 | 对应 STL | 底层结构 | 关键差异 |
| --- | --- | --- | --- |
| `TArray<T>` | `std::vector<T>` | 动态数组（连续） | UE5 支持自定义分配器为模板参数；扩容策略可配置 |
| `TMap<K,V>` | `std::unordered_map<K,V>` | 哈希表（Separate Chaining） | UE5 的 TMap 元素有序！按插入顺序遍历；STL unordered\_map 无序 |
| `TSet<T>` | `std::unordered_set<T>` | 哈希表 | 同上——TSet 保持插入顺序 |
| `TMultiMap<K,V>` | `std::unordered_multimap` | 哈希表（允许多值） | 一个 Key 可对应多个 Value |
| `TSortedMap<K,V>` | `std::map<K,V>` | 红黑树（有序） | UE5 少用有序容器，优先哈希表 |
| `TArrayView<T>` | `std::span<T>` | 指针+长度（不拥有） | 轻量级视图，不拷贝数据，只持有指针和大小 |
| `FString` | `std::string` | TArray<TCHAR> | UE5 原生 UTF-16，std::string 是 char |

#### TArray 的扩容与分配器

TArray 的扩容机制和 vector 类似，但它把**分配器作为模板参数**暴露出来，对应 SGI STL 的 allocator 思想：

```
// TArray 默认使用 FDefaultAllocator（封装了 GMalloc）
TArray<int32> Arr;  // 内部用 FHeapAllocator → GMalloc → FMemory::Malloc

// 可以切换分配器：
TArray<int32, TInlineAllocator<4>> SmallArr;    // ≤4 个元素时用栈内存，超了才堆分配
TArray<int32, TInlineAllocator<16>> MediumArr;  // ≤16 个元素用栈内存
// TInlineAllocator 利用了 C++ 的局部变量（栈分配），小而快
```

**TInlineAllocator** 是 UE5 对 SGI STL 双层配置器思想的现代实践——**小内存用栈免 malloc，大内存才走堆**。这和 SGI 的 free\_list 池化思路一致，目标相同：消除频繁小内存分配的开销。

#### UE5 的 FMemory 与 GMalloc

```
// UE5 有两层内存分配抽象：
FMemory::Malloc(Size);   // 第一层：工具函数，加调试追踪
  └── GMalloc->Malloc(); // 第二层：可替换的底层分配器（默认是 FMallocBinned）
                         //   FMallocBinned2  —— UE5 默认，分桶分配器（类似 SGI alloc）
                         //   FMallocAnsi      —— 直接调 malloc（类似 new_allocator）
                         //   FMallocTBB       —— Intel TBB 分配器
                         //   FMallocStomp     —— Debug 用，检测越界和悬空指针
```

> **FMallocBinned2 跟 SGI STL alloc 的相似之处：**按大小分桶（bins），小对象走池化分配，减少 cookie 开销和内核调用。区别在于 SGI 用 16 条自由链表手动管理，UE5 的 Binned 更复杂但原理相同——**空间换时间，减少 malloc 调用次数**。

#### TArray 深度用法

TArray 是 UE5 中使用频率最高的容器。对应 C++ 的 `std::vector`，但有更丰富的调试和内存控制能力：

```
// ===== 创建与初始化 =====
TArray<int32> Arr;                          // 空数组
TArray<int32> Arr2 = {1, 2, 3, 4, 5};      // 初始化列表（C++11）
TArray<int32> Arr3; Arr3.Reserve(100);      // 预分配容量（类似 vector::reserve）
TArray<FVector> Points; Points.SetNum(64);  // 直接设置元素数量（64 个默认构造的 FVector）

// ===== 添加（对应 push_back / emplace_back）=====
Arr.Add(42);                  // 尾加，容量不足时触发扩容
Arr.Emplace(10);              // 原地构造（对应 emplace_back），避免临时对象拷贝
Arr.EmplaceAt(0, 99);         // 在索引 0 处原地构造
Arr.Insert(5, 2);             // 在索引 2 处插入值 5（O(n)）
Arr.Append({10, 20, 30});     // 批量追加

// ===== 删除 =====
Arr.Remove(42);               // 删除所有值为 42 的元素（线性查找 + 搬移）
Arr.RemoveAt(3);              // 按索引删除（O(n)，后面的元素前移）
Arr.RemoveAtSwap(3);          // ⚡ 按索引删除但用最后一个元素填补空位（O(1)，不保序）
Arr.Pop();                    // 移除尾部（stack 用法）
Arr.Empty();                  // 清空但保留内存（= clear）
Arr.Reset();                  // 清空并释放内存

// ===== 查找与判断 =====
bool bContains = Arr.Contains(42);             // 是否存在（线性查找 O(n)）
int32 Idx = Arr.Find(42);                      // 返回索引，找不到返回 INDEX_NONE(-1)
int32 Idx2 = Arr.FindLast(42);                 // 从尾部查找
FVector* Found = Points.FindByPredicate(       // 按条件查找
    [](const FVector& V) { return V.X > 100.0f; });
int32 Count = Arr.FindLastByPredicate(         // 从尾部按条件查找
    [](int32 V) { return V > 50; });

// ===== 排序与算法（对应 <algorithm>）=====
Arr.Sort();                                    // 升序（默认 operator<）
Arr.Sort([](int32 A, int32 B) { return A > B; }); // 降序
Arr.StableSort([](int32 A, int32 B) { ... });  // 稳定排序
Arr.HeapSort();                                // 堆排序
Points.Sort([](const FVector& A, const FVector& B) {
    return A.Size() < B.Size();                // 按向量长度排序
});

// ===== 内存管理 =====
int32 Num    = Arr.Num();        // 元素数量（= size()）
int32 Max    = Arr.Max();        // 当前容量（= capacity()）
int32 Slack  = Arr.GetSlack();   // 剩余容量 = Max - Num
Arr.Shrink();                    // 释放多余容量（= shrink_to_fit）
Arr.Reserve(256);                // 预分配，避免反复扩容
```

**RemoveAtSwap 的底层**——体现了 UE5"游戏性能优先"的设计哲学：

```
// RemoveAtSwap 内部实现（简化）：
void RemoveAtSwap(int32 Index) {
    if (Index < Num() - 1) {
        // 用最后一个元素覆盖被删除的位置——O(1)！
 Data[Index] = MoveTemp(Data[Num() - 1]);  // 移动赋值
    }
    --ArrayNum;  // 只减计数，不动内存
}
// 代价：元素顺序被破坏。适用场景：不关心顺序，只当"池"用
```

#### TMap 深度用法

TMap 底层是**哈希表（Separate Chaining）**，但遍历时**保持插入顺序**——这是对 STL `unordered_map` 的最大改进：

```
// ===== 创建 =====
TMap<FName, int32> Scores;
TMap<int32, FString> IdToName;
TMap<FName, TArray<FVector>> BonePositions;  // 嵌套容器

// ===== 添加与更新 =====
Scores.Add(TEXT("Player1"), 100);          // 添加（Key 已存在则断言失败）
Scores.Emplace(TEXT("Player2"), 200);      // 原地构造
Scores.FindOrAdd(TEXT("Player3"), 0);      // 存在则返回引用，不存在则添加后返回
Scores[TEXT("Player1")] = 150;             // operator[] —— 存在就更新，不存在就插入默认值

// ===== 查找（关键：TMap 的 Find 返回指针，不是迭代器）=====
int32* Found = Scores.Find(TEXT("Player1"));   // 返回值的指针！
if (Found) {
    int32 Score = *Found;                      // 解引用获取值
    *Found = 999;                              // 修改（直接通过指针修改 Map 中的值）
}
// 这和 STL 的 iterator 完全不同——更接近 C 风格的"查表返回指针"

// ===== 遍历 =====
// 方式1：范围 for（推荐，简洁）
for (const TPair<FName, int32>& Pair : Scores) {
    UE_LOG(LogTemp, Log, TEXT("%s → %d"), *Pair.Key.ToString(), Pair.Value);
}
// 方式2：结构化绑定（C++17）
for (const auto& [Key, Value] : Scores) {
    UE_LOG(LogTemp, Log, TEXT("%s → %d"), *Key.ToString(), Value);
}
// 方式3：迭代器查找并修改
for (auto It = Scores.CreateIterator(); It; ++It) {
    if (It->Value < 60) {
        It.RemoveCurrent();  // 遍历中安全删除
    }
}

// ===== 删除 =====
Scores.Remove(TEXT("Player1"));       // 按 Key 删除
int32 Removed = Scores.RemoveAndCopyValue(TEXT("Player1")); // 删除并返回旧值
Scores.Empty();                       // 清空
Scores.Reset();                       // 清空 + 释放 buckets

// ===== 其他常用 =====
int32 Count = Scores.Num();
bool bHas = Scores.Contains(TEXT("Player1"));
Scores.Reserve(256);                  // 预分配 bucket
TArray<FName> Keys;
Scores.GetKeys(Keys);                 // 获取所有 Key
TArray<int32> Values;
Scores.GenerateValueArray(Values);    // 获取所有 Value
```

<div class="tip-card"><strong>🔗 TMap Find 返回指针 vs STL 返回 iterator：</strong>这是 UE5 容器 API 风格的缩影——<strong>用指针代替迭代器</strong>。指针天然支持 <code>if (ptr)</code> 判空，比 <code>if (it != map.end())</code> 简洁；而且指针可以直接解引用修改值，不需要 <code>it-&gt;second</code>。这实际上是 C 风格和 C++ 风格的折中——保持了底层"指针就是地址"的直觉。</div>

#### TSet 深度用法

TSet 可以理解为"没有 Value 的 TMap"——只存 Key，保证唯一性，底层同样是哈希表：

```
// ===== 创建与操作 =====
TSet<FName> ActiveTags;
ActiveTags.Add(TEXT("Poisoned"));
ActiveTags.Add(TEXT("Burning"));
ActiveTags.Emplace(TEXT("Stunned"));

// 添加——已存在时返回索引，不重复添加
int32 Idx = ActiveTags.Add(TEXT("Poisoned"));  // 返回已有元素的索引，不重复

// ===== 查找 =====
bool bHasPoison = ActiveTags.Contains(TEXT("Poisoned"));  // O(1) 平均
FName* Found = ActiveTags.Find(TEXT("Burning"));           // 返回元素指针
int32 Index = ActiveTags.FindId(TEXT("Stunned"));          // 返回内部索引（用于快速访问）

// ===== 集合运算 =====
TSet<int32> A = {1, 2, 3, 4};
TSet<int32> B = {3, 4, 5, 6};

TSet<int32> UnionSet = A.Union(B);            // 并集 {1,2,3,4,5,6}
TSet<int32> InterSet = A.Intersect(B);        // 交集 {3,4}
TSet<int32> DiffSet  = A.Difference(B);       // 差集 {1,2}（元素在 A 但不在 B）

// ===== 删除 =====
ActiveTags.Remove(TEXT("Stunned"));          // O(1) 平均
for (auto It = ActiveTags.CreateIterator(); It; ++It) {
    if (It->ToString().StartsWith(TEXT("B"))) {
        It.RemoveCurrent();  // 遍历中安全删除
    }
}

// ===== 遍历 =====
for (const FName& Tag : ActiveTags) { ... }
for (auto It = ActiveTags.CreateConstIterator(); It; ++It) { ... }
```

#### TTuple —— UE5 的元组

UE5 的 `TTuple` 就是 `std::tuple` 的引擎版本，用于在模板代码中打包多个不同类型的数据：

```
// ===== 创建 TTuple =====
TTuple<int32, FString, float> Data(42, TEXT("Hello"), 3.14f);

// UE5 特有：MakeTuple 工厂函数（类似 std::make_tuple）
auto Data2 = MakeTuple(100, FString(TEXT("World")), 2.718f);

// ===== 访问元素 =====
int32 First  = Data.Get<0>();            // 按索引获取（编译期确定类型）
FString Second = Data.Get<1>();
float Third   = Data.Get<2>();

// C++17 结构化绑定
auto& [A, B, C] = Data;
// A=42, B="Hello", C=3.14

// ===== 修改元素 =====
Data.Get<0>() = 999;                     // Get 返回引用，可以直接修改
Data.Set<1>(TEXT("Modified"));

// ===== 解包（Unpack/Tie）=====
int32 OutInt;
FString OutStr;
float OutFloat;
// UE5 风格的 Tie（类似 std::tie + 结构化绑定混合）
Tie(OutInt, OutStr, OutFloat) = Data;   // 一次解包到多个变量

// ===== 实际应用：函数返回多个值 =====
TTuple<bool, FVector> FindSpawnPoint(AActor* Requester) {
    if (/* 找到合法点 */) {
        return MakeTuple(true, FVector(100, 200, 300));
    }
    return MakeTuple(false, FVector::ZeroVector);
}

// 使用
auto [bFound, Location] = FindSpawnPoint(MyActor);
if (bFound) {
    SpawnActorAt(Location);
}

// ===== 实际应用：TMap 中存多值（Value 是 Tuple）=====
TMap<FName, TTuple<int32, float, bool>> ItemData;
ItemData.Add(TEXT("Sword"), MakeTuple(10, 3.5f, true));

auto& [Damage, Weight, bEquipped] = ItemData[TEXT("Sword")];
// Damage=10, Weight=3.5, bEquipped=true
```

> **设计哲学：**UE5 的 TTuple 设计原则和 STL tuple 一致——**编译期确定类型，运行期通过索引访问**。每个 `Get<N>()` 在编译期就确定了返回类型，零运行时开销。核心区别在于 UE5 的 TTuple 可以与反射/序列化系统集成——带 `UPROPERTY` 的结构体在 UE5 中通常比 TTuple 更优先，因为蓝图无法理解 TTuple。

<span id="ue-modern"></span>

## 🚀 现代 C++ 在 UE5

<span class="ref-tag">现代 C++ / C++11/17/20</span>

#### UE5 的 C++ 标准要求

| UE 版本 | C++ 标准 | 关键特性 |
| --- | --- | --- |
| UE 4.x | C++14 起步，部分 C++17 | auto、lambda、智能指针、移动语义 |
| UE 5.0~5.3 | C++17 | 结构化绑定、std::optional、if constexpr |
| UE 5.4+ | C++20（逐步） | Concepts、std::span（对应 TArrayView）、ranges |

#### 移动语义——MoveTemp

`MoveTemp` 就是 `std::move` 的 UE5 包装。UE5 故意不用标准名，保持命名一致性（MoveTemp 而非 move）：

```
// MoveTemp = std::move —— 把左值转成右值引用，触发移动语义
TArray<int32> Source = {1, 2, 3};
TArray<int32> Dest = MoveTemp(Source);  // Source 变为空，没有拷贝！

// Forward —— 完美转发（对应 std::forward）
template<typename T>
void Wrapper(T&& Arg) {
    TargetFunc(Forward<T>(Arg));  // 保持 Arg 的左值/右值属性
}
```

#### UE5 对现代 C++ 的取舍

<div class="tip-card"><strong>⚖️ UE5 的立场：</strong>Epic 对现代 C++ 持<strong>"谨慎采纳"</strong>态度——不是所有新特性都适合百万行级别的游戏引擎。编译时间、调试体验、跨平台一致性比语法糖更重要。</div>

| 特性 | UE5 态度 | 原因 |
| --- | --- | --- |
| `auto` | ✅ 大量使用 | 减少冗长类型名（尤其 TMap::TConstIterator），提高可读性 |
| Range-for | ✅ 推荐使用 | `for (AActor* Actor : Actors)` 简洁安全 |
| `nullptr` | ✅ 替代 NULL | 类型安全，不和 int 歧义 |
| `override` | ✅ 强制要求 | 编译器验证是否正确覆写了基类虚函数 |
| `enum class` | ⚠️ 代替 UENUM | UENUM 有反射，强类型枚举没有——需要反射时用 UENUM |
| 结构化绑定 | ⚠️ 有限使用 | `auto [Key, Value] = Map.Find(Key);` |
| Concepts (C++20) | ⚠️ 实验性 | UE5.4+ 开始引入，用于约束容器和算法的模板参数 |
| 异常（Exceptions） | ❌ 禁用 | 性能开销 + 不可预测的控制流。UE5 用返回值 + IsValid() 检查 |
| RTTI (dynamic\_cast) | ❌ 禁用 | 空间开销大。UE5 用反射系统的 Cast<> 替代 |
| STL 容器 | ❌ 不推荐 | UE5 有自己的容器体系（见 Module 9） |

#### UE5 风格的现代 C++ 示例

```
// ===== UE5 风格的 auto + range-for =====
for (const auto& Pair : MyMap) {          // auto → TMap<FName, int32>::ElementType
    UE_LOG(LogTemp, Log, TEXT("%s → %d"), *Pair.Key.ToString(), Pair.Value);
}

// ===== 结构化绑定（C++17） =====
if (auto* Found = MyMap.Find(SearchKey)) {
    auto& [Key, Value] = *Found;          // Key=FName, Value=int32
}

// ===== 移动语义避免拷贝 =====
TArray<FVector> GeneratePoints(int32 Count) {
    TArray<FVector> Points;
    Points.Reserve(Count);
    for (int32 i = 0; i < Count; ++i) {
        Points.Add(FVector(i, i*2, i*3));
    }
    return MoveTemp(Points);  // 移动返回，避免拷贝整数组
}

// ===== Lambda + 委托（UE5 风格） =====
AsyncTask(ENamedThreads::GameThread, [WeakThis = TWeakObjectPtr<AActor>(this)]() {
    if (WeakThis.IsValid()) {
        WeakThis->DoSomething();  // 回到 GameThread 安全操作
    }
});
```

> 理解 UE5 对现代 C++ 的态度，就是理解**工程现实与语言美学的权衡**。“好用”在百万行代码、多平台、百人协作面前，比"正确"更重要。但核心特性——移动语义、auto、lambda、智能指针——仍然是 UE5 性能基石，用好了才能写出高性能的游戏代码。
