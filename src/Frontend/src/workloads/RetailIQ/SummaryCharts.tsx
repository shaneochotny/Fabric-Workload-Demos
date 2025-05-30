// Libraries
import React from "react";

// Components
import { Box, Group, SegmentedControl, Text } from '@mantine/core';
import { Heatmap } from './Heatmap';
import { BarChart } from './BarChart';
import { AreaChart } from './AreaChart';

// Interfaces
import { IPageProps } from 'interfaces';
import { ItemPayload, WorkloadItem } from 'models/SampleWorkloadModel';

// Hooks
import { useUIStore, useShallow } from 'hooks/useRetailIQ';

// Styles & Images
import { SlideGridFilled, DataBarVerticalAscendingFilled, DataAreaFilled } from "@fluentui/react-icons";


const useUIStoreSelector = (state: any) => ({
  graphType: state.graphType,
  setGraphType: state.setGraphType,
  showBy: state.showBy,
  setShowBy: state.setShowBy,
  pivotBy: state.pivotBy,
  setPivotBy: state.setPivotBy,
});

interface Props extends IPageProps {
  itemDetails: WorkloadItem<ItemPayload>;
};

export function SummaryCharts({ itemDetails, workloadClient }: Props) {
  const { graphType, setGraphType, showBy, setShowBy, pivotBy, setPivotBy } = useUIStore(useShallow(useUIStoreSelector));

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fz="md" fw={500}>Sales: Last 7 Days</Text>
          <Text fz="sm" c="dimmed">
            {(pivotBy === 'last7DaysSales' ? 'Units Sold' : 'Inventory on Hand') + ' by ' + (showBy === 'StoreName' ? 'Store Name' : 'Product Name')}
          </Text>
        </div>
        <Group justify="flex-end">
          {graphType !== 'Heatmap' &&
            <SegmentedControl
              radius="xs"
              size="xs"
              color="#117865"
              value={showBy}
              onChange={setShowBy}
              data={[
                { value: 'StoreName', label: 'Store' },
                { value: 'ProductName', label: 'Product' },
              ]}
            />
          }
          <SegmentedControl
            radius="xs"
            size="xs"
            color="#117865"
            value={pivotBy}
            onChange={setPivotBy}
            data={[
              { value: 'last7DaysSales', label: 'Units Sold' },
              { value: 'inventoryOnHand', label: 'Inventory on Hand' },
            ]}
          />
          <SegmentedControl
            radius="xs"
            size="xs"
            color="#117865"
            value={graphType}
            onChange={setGraphType}
            data={[
              { value: 'Heatmap', label: <SlideGridFilled fontSize={20} /> },
              { value: 'Bar', label: <DataBarVerticalAscendingFilled fontSize={20} /> },
              { value: 'Area', label: <DataAreaFilled fontSize={20} /> },
            ]}
          />
        </Group>
      </Group>
      {graphType === 'Heatmap' ?
        <Heatmap itemDetails={itemDetails} workloadClient={workloadClient} />
      : graphType === 'Bar' ?
        <BarChart itemDetails={itemDetails} workloadClient={workloadClient} />
      :
        <AreaChart itemDetails={itemDetails} workloadClient={workloadClient} />
      }
    </Box>
  )
};