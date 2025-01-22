import React, { useState, useMemo } from 'react';
import { Card, Select, InputNumber, Typography, Row, Col, Divider, message } from 'antd';
import styles from './UnitConverter.module.css';

const { Title } = Typography;
const { Option } = Select;

// 单位类型
type UnitType = 'length' | 'area' | 'volume' | 'weight' | 'temperature';

// 单位配置
const unitConfigs = {
  length: {
    name: '长度',
    units: {
      km: { name: '千米', ratio: 1000 },
      m: { name: '米', ratio: 1 },
      dm: { name: '分米', ratio: 0.1 },
      cm: { name: '厘米', ratio: 0.01 },
      mm: { name: '毫米', ratio: 0.001 },
      mile: { name: '英里', ratio: 1609.344 },
      yard: { name: '码', ratio: 0.9144 },
      foot: { name: '英尺', ratio: 0.3048 },
      inch: { name: '英寸', ratio: 0.0254 },
    },
  },
  area: {
    name: '面积',
    units: {
      km2: { name: '平方千米', ratio: 1000000 },
      m2: { name: '平方米', ratio: 1 },
      dm2: { name: '平方分米', ratio: 0.01 },
      cm2: { name: '平方厘米', ratio: 0.0001 },
      mm2: { name: '平方毫米', ratio: 0.000001 },
      ha: { name: '公顷', ratio: 10000 },
      acre: { name: '英亩', ratio: 4046.856 },
    },
  },
  volume: {
    name: '体积',
    units: {
      m3: { name: '立方米', ratio: 1000 },
      dm3: { name: '立方分米', ratio: 1 },
      cm3: { name: '立方厘米', ratio: 0.001 },
      mm3: { name: '立方毫米', ratio: 0.000001 },
      l: { name: '升', ratio: 1 },
      ml: { name: '毫升', ratio: 0.001 },
      gallon: { name: '加仑', ratio: 3.785412 },
    },
  },
  weight: {
    name: '重量',
    units: {
      t: { name: '吨', ratio: 1000 },
      kg: { name: '千克', ratio: 1 },
      g: { name: '克', ratio: 0.001 },
      mg: { name: '毫克', ratio: 0.000001 },
      lb: { name: '磅', ratio: 0.4535924 },
      oz: { name: '盎司', ratio: 0.02834952 },
    },
  },
  temperature: {
    name: '温度',
    units: {
      c: { name: '摄氏度', ratio: 1 },
      f: { name: '华氏度', ratio: 1 },
      k: { name: '开尔文', ratio: 1 },
    },
  },
};

const UnitConverter: React.FC = () => {
  // 状态管理
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('cm');
  const [value, setValue] = useState<number>(1);

  // 获取当前单位类型的配置
  const currentConfig = unitConfigs[unitType];

  // 计算转换结果
  const result = useMemo(() => {
    if (!value) return 0;

    // 温度需要特殊处理
    if (unitType === 'temperature') {
      if (fromUnit === 'c' && toUnit === 'f') {
        return value * 9/5 + 32;
      } else if (fromUnit === 'f' && toUnit === 'c') {
        return (value - 32) * 5/9;
      } else if (fromUnit === 'c' && toUnit === 'k') {
        return value + 273.15;
      } else if (fromUnit === 'k' && toUnit === 'c') {
        return value - 273.15;
      } else if (fromUnit === 'f' && toUnit === 'k') {
        return (value - 32) * 5/9 + 273.15;
      } else if (fromUnit === 'k' && toUnit === 'f') {
        return (value - 273.15) * 9/5 + 32;
      }
      return value;
    }

    // 其他单位通过比率换算
    const fromRatio = currentConfig.units[fromUnit].ratio;
    const toRatio = currentConfig.units[toUnit].ratio;
    return (value * fromRatio) / toRatio;
  }, [value, fromUnit, toUnit, unitType]);

  // 处理单位类型变化
  const handleUnitTypeChange = (newType: UnitType) => {
    setUnitType(newType);
    const units = Object.keys(unitConfigs[newType].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
  };

  // 处理输入值变化
  const handleValueChange = (val: number | null) => {
    if (val === null) {
      setValue(0);
      return;
    }
    
    // 转换为字符串并检查长度
    const strVal = val.toString();
    if (strVal.length > 15) {
      message.warning('输入长度不能超过15个字符');
      // 截取前15个字符并转回数字
      setValue(Number(strVal.slice(0, 15)));
      return;
    }
    
    setValue(val);
  };

  return (
    <div className={styles.container}>
      <Card>
        <Title level={2}>单位转换工具</Title>
        <div className={styles.content}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Select
                value={unitType}
                onChange={handleUnitTypeChange}
                className={styles.select}
              >
                {Object.entries(unitConfigs).map(([key, config]) => (
                  <Option key={key} value={key}>{config.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className={styles.converterRow}>
            <Col xs={24} sm={10}>
              <InputNumber
                value={value}
                onChange={handleValueChange}
                className={styles.input}
                placeholder="输入数值"
                maxLength={15}
                controls={false}
              />
              <Select
                value={fromUnit}
                onChange={setFromUnit}
                className={styles.select}
              >
                {Object.entries(currentConfig.units).map(([key, unit]) => (
                  <Option key={key} value={key}>{unit.name}</Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={4} className={styles.equalSign}>
              <Divider type="vertical" className={styles.divider} />
              <span>=</span>
              <Divider type="vertical" className={styles.divider} />
            </Col>

            <Col xs={24} sm={10}>
              <InputNumber
                value={Number(result.toFixed(6))}
                readOnly
                className={styles.input}
              />
              <Select
                value={toUnit}
                onChange={setToUnit}
                className={styles.select}
              >
                {Object.entries(currentConfig.units).map(([key, unit]) => (
                  <Option key={key} value={key}>{unit.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default UnitConverter; 