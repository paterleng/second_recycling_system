import { useEffect } from "react";
import { useLanguage } from "./LanguageContext";

/**
 * 动态页面标题组件
 * 根据当前语言设置页面标题
 */
export function DynamicTitle() {
  const { t } = useLanguage();

  useEffect(() => {
    // 设置页面标题
    document.title = t("page.title");
  }, [t]);

  // 这个组件不渲染任何内容，只负责更新标题
  return null;
}
