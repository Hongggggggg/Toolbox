import React, { useState, useCallback, useMemo } from 'react';
import { Card, Input, Checkbox, Typography, message, Button } from 'antd';
import styles from './RegexTester.module.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const MAX_INPUT_LENGTH = 10000;

interface MatchResult {
  index: number;
  match: string;
  groups: string[];
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);

  // 构建正则表达式标志
  const flagString = useMemo(() => {
    let result = '';
    if (flags.global) result += 'g';
    if (flags.ignoreCase) result += 'i';
    if (flags.multiline) result += 'm';
    if (flags.dotAll) result += 's';
    if (flags.unicode) result += 'u';
    if (flags.sticky) result += 'y';
    return result;
  }, [flags]);

  // 处理测试文本输入
  const handleTestStringChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_INPUT_LENGTH) {
      setTestString(value);
    } else {
      message.warning('已达到最大字符限制');
    }
  };

  // 执行正则表达式测试
  const testRegex = useCallback(() => {
    if (!pattern) {
      setError('请输入正则表达式');
      setMatches([]);
      return;
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const results: MatchResult[] = [];
      let match;

      if (flags.global) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });
        }
      }

      setMatches(results);
      setError('');

      if (results.length === 0) {
        message.info('没有找到匹配项');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的正则表达式');
      setMatches([]);
    }
  }, [pattern, testString, flagString, flags.global]);

  // 高亮显示匹配结果
  const highlightMatches = useCallback(() => {
    if (!testString || matches.length === 0) return testString;

    let result = testString;
    let offset = 0;

    matches.forEach(({ index, match }) => {
      const start = index + offset;
      const end = start + match.length;
      const before = result.slice(0, start);
      const after = result.slice(end);
      result = before + `<span class="${styles.highlight}">${match}</span>` + after;
      offset += `<span class="${styles.highlight}"></span>`.length;
    });

    return result;
  }, [testString, matches]);

  return (
    <div className={styles.container}>
      <Card>
        <Title level={2}>正则表达式测试工具</Title>
        <div className={styles.content}>
          <div className={styles.regexInput}>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式，例如: \w+，按回车确认"
              onPressEnter={testRegex}
            />
            <Button type="primary" onClick={testRegex}>
              测试
            </Button>
          </div>

          <div className={styles.flags}>
            <Checkbox
              checked={flags.global}
              onChange={(e) => setFlags({ ...flags, global: e.target.checked })}
            >
              全局 (g)
            </Checkbox>
            <Checkbox
              checked={flags.ignoreCase}
              onChange={(e) => setFlags({ ...flags, ignoreCase: e.target.checked })}
            >
              忽略大小写 (i)
            </Checkbox>
            <Checkbox
              checked={flags.multiline}
              onChange={(e) => setFlags({ ...flags, multiline: e.target.checked })}
            >
              多行 (m)
            </Checkbox>
            <Checkbox
              checked={flags.dotAll}
              onChange={(e) => setFlags({ ...flags, dotAll: e.target.checked })}
            >
              点匹配所有 (s)
            </Checkbox>
            <Checkbox
              checked={flags.unicode}
              onChange={(e) => setFlags({ ...flags, unicode: e.target.checked })}
            >
              Unicode (u)
            </Checkbox>
            <Checkbox
              checked={flags.sticky}
              onChange={(e) => setFlags({ ...flags, sticky: e.target.checked })}
            >
              粘性 (y)
            </Checkbox>
          </div>

          <div className={styles.inputSection}>
            <div className={styles.inputHeader}>
              <Text strong>测试文本：</Text>
              <Text type="secondary" className={styles.charCount}>
                {testString.length}/{MAX_INPUT_LENGTH}
              </Text>
            </div>
            <TextArea
              value={testString}
              onChange={handleTestStringChange}
              placeholder="输入要测试的文本"
              className={styles.testInput}
              rows={6}
              maxLength={MAX_INPUT_LENGTH}
              onPressEnter={testRegex}
            />
          </div>

          {error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <div className={styles.results}>
              <div className={styles.resultHeader}>
                <Text strong>匹配结果：</Text>
                {matches.length > 0 && (
                  <Text type="secondary">
                    共找到 {matches.length} 个匹配
                  </Text>
                )}
              </div>
              {matches.length > 0 && (
                <>
                  <div
                    className={styles.matchResult}
                    dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                  />
                  <div className={styles.matchInfo}>
                    <Text strong>匹配详情：</Text>
                    {matches.map((match, index) => (
                      <div key={index} className={styles.matchGroup}>
                        <span className={styles.groupIndex}>匹配 {index + 1}:</span>
                        <span className={styles.groupContent}>{match.match}</span>
                      </div>
                    ))}
                    {matches.some(match => match.groups.length > 0) && (
                      <div className={styles.matchGroups}>
                        {matches.map((match, matchIndex) =>
                          match.groups.map((group, groupIndex) => (
                            <div key={`${matchIndex}-${groupIndex}`} className={styles.matchGroup}>
                              <span className={styles.groupIndex}>
                                匹配 {matchIndex + 1}, 组 {groupIndex + 1}:
                              </span>
                              <span className={styles.groupContent}>{group}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RegexTester; 