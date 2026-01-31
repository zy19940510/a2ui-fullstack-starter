import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

class SkillLoader {
  constructor(skillsDir = null) {
    // 默认使用 Claude Code 的 skills 目录
    this.skillsDir = skillsDir || path.join(os.homedir(), '.claude', 'skills');
  }

  /**
   * 加载一个 skill
   * @param {string} skillName - skill 名称，如 'a2ui-custom-components'
   * @param {string} args - 传递给 skill 的参数（可选）
   * @returns {object} - { success, name, description, content, baseDir }
   */
  loadSkill(skillName, args = '') {
    try {
      // 1. 定位 skill 目录
      const skillBaseDir = path.join(this.skillsDir, skillName);

      // 2. 查找 SKILL.md 文件（尝试多种可能的文件名）
      const possibleFiles = ['SKILL.md', 'skill.md', 'README.md'];
      let skillFilePath = null;

      for (const fileName of possibleFiles) {
        const testPath = path.join(skillBaseDir, fileName);
        if (fs.existsSync(testPath)) {
          skillFilePath = testPath;
          break;
        }
      }

      if (!skillFilePath) {
        throw new Error(`Skill file not found in ${skillBaseDir}`);
      }

      // 3. 读取文件内容
      const rawContent = fs.readFileSync(skillFilePath, 'utf-8');

      // 4. 解析 frontmatter
      const { frontmatter, content } = this.parseFrontmatter(rawContent);

      // 5. 构建完整的 skill 上下文
      const skillContext = this.buildSkillContext(
        skillBaseDir,
        content,
        args
      );

      // 6. 输出加载信息（模拟 Claude Code 的格式）
      console.log(`⏺ Skill(${skillName})`);
      console.log(`  ⎿ Successfully loaded skill`);

      return {
        success: true,
        name: frontmatter.name || skillName,
        description: frontmatter.description || '',
        content: skillContext,
        baseDir: skillBaseDir,
        frontmatter
      };

    } catch (error) {
      console.error(`⏺ Skill(${skillName})`);
      console.error(`  ⎿ Failed to load skill: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 解析 frontmatter（YAML 头部信息）
   */
  parseFrontmatter(content) {
    // 检查是否有 frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (match) {
      const frontmatterYaml = match[1];
      const mainContent = match[2];

      try {
        const frontmatter = yaml.load(frontmatterYaml);
        return { frontmatter, content: mainContent };
      } catch (error) {
        console.warn('Failed to parse frontmatter:', error.message);
        return { frontmatter: {}, content };
      }
    }

    // 没有 frontmatter，返回整个内容
    return { frontmatter: {}, content };
  }

  /**
   * 构建 skill 上下文（模拟 Claude Code 发送给 LLM 的格式）
   */
  buildSkillContext(baseDir, content, args) {
    let context = `Base directory for this skill: ${baseDir}\n\n`;
    context += content;

    if (args) {
      context += `\n\nARGUMENTS: ${args}`;
    }

    return context;
  }

  /**
   * 列出所有可用的 skills
   */
  listSkills() {
    try {
      const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
      const skills = [];

      for (const entry of entries) {
        if (entry.isDirectory() || entry.isSymbolicLink()) {
          const skillPath = path.join(this.skillsDir, entry.name);

          // 尝试读取 frontmatter
          const possibleFiles = ['SKILL.md', 'skill.md', 'README.md'];
          for (const fileName of possibleFiles) {
            const filePath = path.join(skillPath, fileName);
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8');
              const { frontmatter } = this.parseFrontmatter(content);

              skills.push({
                name: entry.name,
                description: frontmatter.description || 'No description',
                path: skillPath
              });
              break;
            }
          }
        }
      }

      return skills;
    } catch (error) {
      console.error('Failed to list skills:', error.message);
      return [];
    }
  }
}

// ============================================
// 使用示例
// ============================================

const loader = new SkillLoader();

// 1. 列出所有 skills
console.log('Available skills:');
const skills = loader.listSkills();
skills.slice(0, 5).forEach(skill => {
  console.log(`  - ${skill.name}: ${skill.description}`);
});
console.log('');

// 2. 加载一个 skill
const result = loader.loadSkill('a2ui-custom-components', 'create a button component');

if (result.success) {
  console.log('\nSkill loaded successfully!');
  console.log('Name:', result.name);
  console.log('Description:', result.description);
  console.log('\nSkill content preview:');
  console.log(result.content.substring(0, 300) + '...\n');

  // 这里你可以将 result.content 添加到 LLM 的 system message 中
  // 例如使用 OpenAI API:
  /*
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: result.content },
      { role: "user", content: "Your user's message here" }
    ]
  });
  */
}

export default SkillLoader;
