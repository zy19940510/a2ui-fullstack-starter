import os
import yaml
from pathlib import Path

class SkillLoader:
    def __init__(self, skills_dir=None):
        """初始化 Skill Loader"""
        # 默认使用项目的 .claude/skills 目录
        if skills_dir is None:
            project_root = Path(__file__).parent.parent.parent.parent  # a2ui-test 根目录
            skills_dir = project_root / ".claude" / "skills"

        self.skills_dir = Path(skills_dir)

    def load_skill(self, skill_name: str, args: str = "") -> dict:
        """
        加载一个 skill

        Args:
            skill_name: skill 名称，如 'a2ui'
            args: 传递给 skill 的参数（可选）

        Returns:
            {
                "success": bool,
                "name": str,
                "description": str,
                "content": str,  # 完整的 skill 内容（用于注入 LLM）
                "base_dir": str,
                "frontmatter": dict
            }
        """
        try:
            # 1. 定位 skill 目录
            skill_base_dir = self.skills_dir / skill_name

            if not skill_base_dir.exists():
                raise FileNotFoundError(f"Skill directory not found: {skill_base_dir}")

            # 2. 查找 SKILL.md 文件
            possible_files = ['SKILL.md', 'skill.md', 'README.md']
            skill_file_path = None

            for file_name in possible_files:
                test_path = skill_base_dir / file_name
                if test_path.exists():
                    skill_file_path = test_path
                    break

            if not skill_file_path:
                raise FileNotFoundError(f"Skill file not found in {skill_base_dir}")

            # 3. 读取文件内容
            with open(skill_file_path, 'r', encoding='utf-8') as f:
                raw_content = f.read()

            # 4. 解析 frontmatter
            frontmatter, content = self._parse_frontmatter(raw_content)

            # 5. 构建完整的 skill 上下文
            skill_context = self._build_skill_context(
                str(skill_base_dir),
                content,
                args
            )

            return {
                "success": True,
                "name": frontmatter.get("name", skill_name),
                "description": frontmatter.get("description", ""),
                "content": skill_context,
                "base_dir": str(skill_base_dir),
                "frontmatter": frontmatter
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _parse_frontmatter(self, content: str) -> tuple[dict, str]:
        """解析 YAML frontmatter"""
        import re

        frontmatter_regex = r'^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$'
        match = re.match(frontmatter_regex, content)

        if match:
            frontmatter_yaml = match.group(1)
            main_content = match.group(2)

            try:
                frontmatter = yaml.safe_load(frontmatter_yaml)
                return frontmatter or {}, main_content
            except Exception:
                return {}, content

        return {}, content

    def _build_skill_context(self, base_dir: str, content: str, args: str) -> str:
        """构建 skill 上下文（注入到 LLM 的完整内容）"""
        context = f"Base directory for this skill: {base_dir}\n\n"
        context += content

        if args:
            context += f"\n\nARGUMENTS: {args}"

        return context
