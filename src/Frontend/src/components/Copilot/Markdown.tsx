// Libraries
import React from 'react';

// Markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import supersub from 'remark-supersub';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Styles
import classes from './Copilot.module.css';
import 'katex/dist/katex.min.css';
import './Markdown.css';

interface Properties {
  content: string | undefined;
};

export function Markdown ({ content }: Properties) {
  content = content 
    .replace(/\\\[/g, '$$$')  // Replace all occurrences of \[ with $$
    .replace(/\\\]/g, '$$$')  // Replace all occurrences of \] with $$
    .replace(/\\\(/g, '$$$')  // Replace all occurrences of \( with $$
    .replace(/\\\)/g, '$$$'); // Replace all occurrences of \) with $$

  const remarkMathOptions = {
    singleDollarTextMath: false,
  };

  return (
    <ReactMarkdown
      remarkPlugins={[[remarkMath, remarkMathOptions], remarkGfm, supersub, remarkDirective, remarkDirectiveRehype]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1(props) {
          const { node, ...rest } = props
          return <h1 className={classes.h1} {...rest} />
        },
        h2(props) {
          const { node, ...rest } = props
          return <h2 className={classes.h2} {...rest} />
        },
        h3(props) {
          const { node, ...rest } = props
          return <h3 className={classes.h3} {...rest} />
        },
        h4(props) {
          const { node, ...rest } = props
          return <h4 className={classes.h4} {...rest} />
        },
        li(props) {
          const { node, ...rest } = props
          return <li className={classes.li} {...rest} />
        },
        th(props) {
          const { node, ...rest } = props
          return <th className={classes.th} {...rest} />
        },
        td(props) {
          const { node, ...rest } = props
          return <td className={classes.td} {...rest} />
        },
        p(props) {
          const { node, ...rest } = props
          return <p className={classes.p} {...rest} />
        },
        ol(props) {
          const { node, ...rest } = props
          return <ol className={classes.ol} {...rest} />
        },
        ul(props) {
          const { node, ...rest } = props
          return <ul className={classes.ul} {...rest} />
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};