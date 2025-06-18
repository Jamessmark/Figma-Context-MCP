import type { SimplifiedNode } from './simplify-node-response.js';

export interface ComponentExample {
  component: string;
  styles: string;
}

interface ComponentTemplateProps {
  componentName: string;
  props: Record<string, any>;
  children: SimplifiedNode[];
  styles: Record<string, string>;
}

function generateReactComponent({ componentName, props, children, styles }: ComponentTemplateProps): string {
  const propsString = Object.entries(props)
    .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
    .join(' ');

  return `
import React from 'react';
import './${componentName}.css';

export const ${componentName} = () => {
  return (
    <div className="${componentName}" ${propsString}>
      ${generateChildrenJSX(children)}
    </div>
  );
};
`;
}

function generateVueComponent({ componentName, props, children, styles }: ComponentTemplateProps): string {
  const propsString = Object.entries(props)
    .map(([key, value]) => `:${key}="${JSON.stringify(value)}"`)
    .join(' ');

  return `
<template>
  <div class="${componentName}" ${propsString}>
    ${generateChildrenTemplate(children)}
  </div>
</template>

<script>
export default {
  name: '${componentName}',
  props: {},
  data() {
    return {};
  }
};
</script>

<style scoped>
${generateStyles(styles)}
</style>
`;
}

function generateAngularComponent({ componentName, props, children, styles }: ComponentTemplateProps): string {
  const propsString = Object.entries(props)
    .map(([key, value]) => `[${key}]="${JSON.stringify(value)}"`)
    .join(' ');

  return `
import { Component } from '@angular/core';

@Component({
  selector: 'app-${componentName.toLowerCase()}',
  template: \`
    <div class="${componentName}" ${propsString}>
      ${generateChildrenTemplate(children)}
    </div>
  \`,
  styleUrls: ['./${componentName.toLowerCase()}.component.css']
})
export class ${componentName}Component {
}
`;
}

function generateReactNativeComponent({ componentName, props, children, styles }: ComponentTemplateProps): string {
  const propsString = Object.entries(props)
    .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
    .join(' ');

  return `
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ${componentName} = () => {
  return (
    <View style={styles.container} ${propsString}>
      ${generateReactNativeChildren(children)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ${Object.entries(styles[`.${componentName}`] || {})
      .map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`)
      .join('\n')}
  },
});
`;
}

function generateReactNativeChildren(children: SimplifiedNode[]): string {
  return children
    .map((child) => {
      if (child.type === 'TEXT') {
        return `<Text style={styles.text}>${child.text || ''}</Text>`;
      }
      return `<View style={styles.${child.name.toLowerCase()}}>${generateReactNativeChildren(child.children || [])}</View>`;
    })
    .join('\n');
}

function generateStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([selector, rules]) => `${selector} {\n  ${rules}\n}`)
    .join('\n\n');
}

function generateChildrenJSX(children: SimplifiedNode[]): string {
  return children
    .map((child) => {
      if (child.type === 'TEXT') {
        return child.text || '';
      }
      return `<div className="${child.name}">${generateChildrenJSX(child.children || [])}</div>`;
    })
    .join('\n');
}

function generateChildrenTemplate(children: SimplifiedNode[]): string {
  return children
    .map((child) => {
      if (child.type === 'TEXT') {
        return child.text || '';
      }
      return `<div class="${child.name}">${generateChildrenTemplate(child.children || [])}</div>`;
    })
    .join('\n');
}

export function generateComponentExample(componentName: string): ComponentExample {
  let componentCode;
  if (componentName.toLowerCase().includes('price') || 
    componentName.includes('价格')|| 
    componentName.includes('金额')) {
    componentCode = `
    import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from '@kds/web';
import { rem } from '@kds/web-api';
import { Price } from '@es/kprom-common-price-v2';
import { DebugLogger } from '@kwaishop/kwaishop-log';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        padding: rem(5),
        paddingTop: 0,
        paddingRight: 0,
        backgroundColor: '#ffffff',
    },
    lineThroughPrice: {
        marginLeft: rem(8),
    },
    title: {
        marginTop: rem(40),
        fontSize: rem(18),
        fontWeight: 'bold',
    },
    suffixContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: rem(4),
        backgroundColor: '#FFF4F7',
        paddingHorizontal: rem(4),
        paddingVertical: rem(1),
        borderRadius: rem(3),
    },
    suffixContainerText: {
        color: '#FE3666',
        fontSize: rem(11),
        height: rem(12),
        lineHeight: rem(12),
    },
    text: {
        color: '#000000',
    },
});

export const MerchantPrice = (props) => {
    const Tag = 'MerchantPrice';
    useEffect(() => {
        DebugLogger.log(props?.rootTag, Tag, 'MerchantCountDown', {
            props,
        });
    }, [props]);

    const renderCommonPriceV2 = () => {
        return (priceFontSize) => {
            const showPriceLabel = priceFontSize > 16 && priceFontSize < 25;
            return (
                <View
                    key={priceFontSize}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        marginTop: priceFontSize > 25 ? -5 : 0,
                    }}
                >
                    <Text style={styles.text}>{priceFontSize}:</Text>
                    <Price
                        price={8.8}
                        fontSize={priceFontSize}
                        unit={1}
                        sufUnit="起"
                        preText="券后"
                        sellerPoint="优惠50元"
                        priceSuffixLabel={
                            showPriceLabel ? (
                                <View
                                    style={{
                                        backgroundColor: '#FEEAEA',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: rem(2),
                                        paddingHorizontal: rem(4),
                                        marginLeft: rem(3),
                                        top: -1, // 需要业务根据微调对齐
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#F23030',
                                            fontSize: rem(11),
                                            lineHeight: rem(12),
                                        }}
                                    >
                                        7.5折
                                    </Text>
                                </View>
                            ) : null
                        }
                        originalPrice={99}
                        originalPriceUnit={1}
                    />
                </View>
            );
        };
    };

    return (
        <View style={styles.container}>
            {renderCommonPriceV2()}
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.text}>红包场景：</Text>
                <Price price={134.88} fontSize={36} unit={1} decimalSuit />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.text}>纯价格数字部分划线：</Text>
                <Price price={134.88} fontSize={36} unit={1} pureLineThrough />
            </View>
        </View>
    );
};
`;}
  else if (componentName.toLowerCase().includes('countdown') ||
    componentName.toLowerCase().includes('timer')||
    componentName.toLowerCase().includes('time')||
    componentName.includes('倒计时')|| 
    componentName.includes('时间')||
    componentName.includes('秒')) {
  componentCode = `
  import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Text } from '@kds/web';
import { rem } from '@kds/web-api';
import CountDown from '@es/kprom-common-count-down';
import { DebugLogger } from '@kwaishop/kwaishop-log';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
    },
});

export const MerchantCountDown = (props) => {
    const Tag = 'MerchantCountDown';
    useEffect(() => {
        DebugLogger.log(props?.rootTag, Tag, 'MerchantCountDown', {
            props,
        });
    }, [props]);

    const onTimeOut = useCallback(() => {
        console.log('倒计时结束');
    }, []);
    const customStyle = {
        cardTypeTimeTextStyle: {
            color: '#165656',
        },
        cardTypeTimeSymbolStyle: {
            color: '#165656',
        },
        containerStyle: {
            color: '#165656',
        },
        preTextStyle: {
            color: '#165656',
        },
        sufTextStyle: {
            color: '#165656',
        },
        preTextMarginRight: 10,
        sufTextMarginLeft: 10,
        preTextColor: '#165656',
        sufTextColor: '#165656',
        textTypeTimeTextStyle: {
            color: '#165656',
        },
        textTypeTimeSymbolStyle: {
            color: '#165656',
        },
    };
    return (
        <View style={styles.container}>
            <CountDown
                restTime={11260000}
                type="card"
                showDayThreshold={1}
                showMS={true}
                customStyle={customStyle}
                preText="距离结束"
                sufText="后"
                onTimeOut={onTimeOut}
                timeTextBold={true}
                size={15}
            />
        </View>
    );
};
`;}
else{
  componentCode = `
  import React from 'react';
  import { View, Text, StyleSheet } from 'react-native';

  export const ${componentName} = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>This is ${componentName}</Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    text: {
      fontSize: 16,
      color: '#333',
    },
  });
  `;
}


  return {
    component: componentCode.trim(),
    styles: '', // React Native 的样式已包含在组件代码中
  };
}