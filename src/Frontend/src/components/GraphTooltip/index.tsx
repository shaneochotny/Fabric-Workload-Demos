
// Libraries
import React from "react";

// Components
import { Box, Divider, Grid, Group } from '@mantine/core';

// Styles
import classes from './index.module.css';

interface Props {
  indicatorColor: string;
  title?: any;
  subTitle?: any;
  values: TooltipValues[];
};

interface TooltipValues {
  label: any;
  value: any;
}

export function GraphTooltip(props: Props) {
  return (
    <div className={classes.tooltip}>
      <Grid justify="flex-start" gutter={8}>
        <Grid.Col span="content">
          <Box className={classes.indicator} style={{ backgroundColor: props.indicatorColor }}></Box>
        </Grid.Col>
        <Grid.Col span="auto">
          <p className={classes.title}>{props.title}</p>
          <p className={classes.subTitle}>{props.subTitle}</p>
          <Divider className={classes.divider} />
          {props.values.map((value, index) => (
            <Group justify="space-between" wrap="nowrap" key={index}>
              <div className={classes.label}>{value.label}</div>
              <p className={classes.value}>{value.value}</p>
            </Group>
          ))}
        </Grid.Col>
      </Grid>
    </div>
  );
};