# Paper Motion 动效验收

final result: passed

参考对象为 Premotio 首页的滚动场景。实现采用用户提供的六张 DRS 论文截图，标题和底部文案围绕论文主题编写。

在 Chrome 中分别以 390 × 844 和 1360 × 880 CSS 像素、设备像素比 1 对照相同视口的截图。对照覆盖首屏标题、中心白光、卡片密度、立体圆环、斜向网格及底栏位置。两次修订分别调整了首屏飞出方向与深度的分布、圆环的卡片高度和网格的立体间距。最终手机截图中，卡片向四周分散、斜排留有连续间隙，底栏顶边约在屏高的 56.5%。

在本地预览中验证了 WebGL 渲染、桌面反向滚轮、模拟手机触摸滑动、场景菜单跳转和回到首页。检查中未出现页面运行错误或手机横向溢出。构建通过。手机检查使用浏览器模拟视口和触摸事件，真机帧率尚未测量。

## 后续场景

按滚动距离采样参考站从预设区到页尾的画面，在相同视口并排核对队形、步骤列表、编辑器画布、全屏变形、聊天面板、手机模型和画幅预览。对照后调整了编辑器放大比例、变形画面的进出裁切、收尾标题叠色与不拆行处理。论文卡片来自用户素材，编辑器截图、手机模型、屏幕贴图及 Inter Tight 字体来自参考站公开页面。

390 × 844 与 1360 × 880 下，预设选择、色样、滤镜与强度、演示指令、手机屏幕、画幅、分辨率、帧率、计费周期和页尾回到开场均经浏览器验收。完成了模拟触摸和反向滚轮检查，页面无运行错误或横向溢出。320 × 568、844 × 390 及减少动态效果模式下补测了预设直达链接和章节宽度。

MCP 对话使用本地预设剧本。导出段展示设置，实际编辑及套餐入口链接至 Premotio。三维展示使用按需加载的 Three.js 模块，构建器提示该模块压缩前超过 500 kB。

## 卡片穿插修正

按风吹形变的最大振幅检查整张卡片的空间包围盒。四种视口、三个旋转相位、每组 321 个滚动位置，共 3,852 个场景采样，独立包围盒相交检测通过。另对七种预设的持续运转检查卡片尺寸稳定性。浏览器在手机模拟触摸、桌面正反向滚动和禁用 WebGL 的后备渲染下复测了圆环展开、滚筒和叠牌回收。

## 首页光效像素比对

对同一帧卡片分别采集原站加光前与加光后的 RGBA 图像，再用加光前的图像驱动本地光效。对比仅覆盖首页的光学处理。项目预览沿用六张论文截图及当前卡片轨迹。

在 WebGL 2 下，以 8 位 RGB 三个通道最大误差不超过 1 为标准，390 × 844 手机校验帧通过比例为 99.92%，高密度手机帧为 99.94%，1360 × 880 桌面帧为 99.93%。390 × 844 校验帧中，只计入与空白底色相差超过 3 级的区域时，通过比例为 99.44%。逐像素完全相等的手机帧像素为 94.39%。WebGL 1 的兼容采样使用不同的抖动序列，手机校验帧通过比例为 97.83%。

原站空白区域的中位色为 #F5F5F7。中心曝光、径向放大及光谱拖尾作用于经过深度测试的纸片图层。页面文字在最终显示分辨率上叠加。已在原型中复测首次进入、滚动及返回首页。

## 第 05 章研究范围

final result: passed

将用户提供的 390 × 844 英文参考图与同尺寸、设备像素比为 1 的本地预览对照。核对双行标题、橙色短线、说明文换行、五个圆的尺寸与颜色、中心圆、连接圆点以及图标与标签对齐。复测修正了右侧文字与屏幕边缘的间距。外侧圆形按参考图出血，标签保持在视口内。图标使用 Lucide 的对应图形，原有概念边界说明保留在关系图之后。

在 Chromium 验证了白色面板从下方覆盖、文字分批上移渐显、固定期间五项依次聚焦和反向切换。补测 320 × 568 英文、390 × 844 中文、1360 × 880 桌面及减少动态效果模式。浏览器模拟触屏滑动通过。鼠标滚轮前进和回退均经过连续中间位置，滚轮可中断点击播放，随后可重新点击进入第 05 章。构建和 15 项自动测试通过。

## Chapter 06 example and English edition

final result: passed

Compared the supplied example with the 410 × 980 local browser view. Matched the split heading, document fan, storefront diagram, question cards, flow arrows, and closing statement. The responsive desktop layout places the four sections in two columns. The original long scenario and its citation remain available under the diagram.

Verified in Chromium that the main heading and deck rise through their masks and all four cards move in from the right. Checked 320 × 568, 410 × 980, 1360 × 880, direct anchors, click playback from chapter 05, the reduced-motion setting, and English content with legacy language parameters. Adjusted narrow flow labels and reserved space for the desktop card fan above the first row. Build and 15 automated tests passed.

## Chapter 06 follow-up and scroll reversal

final result: passed

Compared the supplied 576 × 1344 reference with the local scope and verification follow-up at the same viewport. Checked the four scope categories, risk callout, verification steps and checklist, three failure cards, and cited research gap. The earlier text remains in the scenario and research details disclosure.

Sampled the heading, paper fan, scenario, and verification section on both sides of the same scroll positions. Coordinates and opacity matched in both directions at 320 × 568, 410 × 980, 576 × 1344, and 1360 × 880. The reduced-motion mode presents the content without a reveal. Verified direct links to chapters 07, 08, and 09.

## Literature Map and transition from the example

final result: passed

Compared the 390 × 1429 reference with the local view. Checked both rings of research-paper images, the four lines of inquiry, the relationship diagram, and the synthesis and research-gap panels. The original literature table remains available under the map.

At 320 × 568, 390 × 844, 390 × 1429, and 1360 × 880, Chromium verified that the example text slides down inside fixed masks. All text clears before the paper sequence begins. Sampled the sequence across both rings to confirm that only one paper advances at a time from the right. Checked reverse scrolling, click playback, and reduced motion.

## Workflow Graph

final result: passed

以 390 CSS 像素、1 倍设备像素比并排核对用户截图和 Chrome 预览。初版沿用了全屏论文轮播，造成封面与说明文字之间的留白过大。调整后，手机上的封面、引导语与正文首节在同一屏内顺次衔接，3 条研究结论保留错位排列和浅蓝、浅绿配色。沿用项目的 Inter Tight 标题、正文样式与珊瑚色标记。

封面暂用 Co-living with agentic AI 论文页，正文暂用 Node Flow 工作流图，配图注明占位用途。Trace2Flow 文案、预印本状态与引用链接可正常阅读。第 14 章直接显示 Workflow Graph，旧文字页和重复折叠说明已移除。390 × 844、320 × 568、844 × 390 和 1280 × 800 完成验收，覆盖轮播正面、章节导航、减少动态效果与横向溢出检查。

## Research Support & Limits

final result: passed

在 390 × 844、1 倍设备像素比的 Chrome 视口中截取滚动后的版面，拼合后与 390 × 1177 的参考图并排核对。标题、珊瑚色分隔线、引导段落及通栏图表的位置与参考接近。标题、注释和三层图表的文字均可选中。按新参考图重绘了平台、方块、网络、箭头和标签。初版纸环在视口顶部被切断，复验版减小了倾角、移动了圆环中心，手机顶部保留约 135 像素的纸环横带。

检查了逐张落入独立环位、整环和白色内容板共同上移、倒滑复原，以及封面 Next scene 按钮。320 × 568、844 × 390 和 1280 × 800 的布局与滚动均通过。减少动态效果时显示静态圆环和正常滚动的内容。无 WebGL 时仍可见同样的纸环推进，纸张以原始图像色彩呈现。

以 470 × 780 的图表区域同尺寸对比矢量版与参考图。核对了三层标题、引导线、平台轮廓、方块位置、节点连线和向下箭头。320 × 568、390 × 844、1280 × 800 均通过遮挡及依次渐现检查，倒滑恢复相同透明度。在减少动态效果模式下，三层直接显示。

图表渐现复验使用手机和桌面视口的中间帧。第一层露出标题和标签时，下部平台仍在淡入，第二和第三层随后出现。核对了未出现区域的像素与页面底色一致，也验证了直达章节时首层有可见的入场过程。

阅读结束转场复验覆盖 320 × 568、390 × 844、844 × 390 和 1280 × 800。第二层图表在视口边缘更早开始渐现。脚注进入视口后，先短暂保持阅读位置，再将整块内容板向下移动，露出背景纸环。倒滑恢复原位，无 WebGL 时仍可见纸环。

## Research Gap 与叠卡尺寸

使用 390 × 844 手机预览对照两张截图。Research Gap 保留参考中的双圆、交集、图标和底部说明框，图形与文字全部用 SVG 实现。确认同一纸环经历聚拢和向外散开两个阶段，图文依次浮现，背景使用首页的飞纸位姿和光效。叠卡内容板上移，390 像素视口的单卡约 312 × 90 像素，卡内字号约 11.9 像素。320 × 568、844 × 390 和 1280 × 800 复验了版面边界，另检查了减少动态效果及前后切场。

## 05 Research Questions

final result: passed

对照本次对话中的两张手机参考图。封面截于 390 × 844 视口，正文以相同宽度分屏截取，均为 1 倍设备像素比。实拍分别为 `/tmp/paper-questions-cover.png`、`/tmp/paper-questions-body.png` 和 `/tmp/paper-questions-body-end.png`。

封面使用现有论文图片。核对了上部纸带、左下双行标题、浅灰章节号和底部导航。初版纸带占用高度偏大，调整后前景收在约 540 像素内。正文顶部纸环约 170 像素，修复了首帧纸环上缘的留白。正文保留参考图的浅底、珊瑚色分隔线、青色 01 与珊瑚色 02，使用现有 Inter Tight 标题和可选择的英文正文。

在 320 × 568、390 × 844、844 × 390 和 1280 × 800 的 Chrome 视口中检查了顺滑、倒滑、直达正文和横向溢出。手机视口另验证了点击跨场和滚轮接管。Research Gap 在原位退场，首张入场纸卡在交接位置已经可见。封面后纸带收成圆环，正文按照标题、小标题、引导语和问题分组上滑显现。减少动态效果时正文直接可读。
