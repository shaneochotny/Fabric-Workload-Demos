// Libraries
import React from 'react';

// Components
import { Tab, TabList } from '@fluentui/react-tabs';
import { Toolbar } from '@fluentui/react-toolbar';
import { SelectTabEvent, SelectTabData, TabValue, ToolbarButton, Tooltip } from '@fluentui/react-components';

// Controller
import { callDatahubOpen, callDialogOpenMsgBox, callItemGet, callOpenSettings } from 'controller/SampleWorkloadController';

// Interfaces
import { IPageProps } from 'interfaces';

// Styles & Images
import { Save24Regular, Settings24Regular, Database24Regular, Delete24Regular } from '@fluentui/react-icons';
import 'styles.scss';


const TabToolbar = (props: RibbonProps) => {
  const { itemObjectId, workloadClient } = props;

  async function onSettingsClicked() {
    // todo: refactor get item to ribbon
    const item = await callItemGet(itemObjectId, workloadClient);
    await callOpenSettings(item, workloadClient, 'About');
  }

  async function onDatahubClicked() {
    // todo: use the selected datahub item object id
    await callDatahubOpen("Select a Lakehouse", true, props.workloadClient);
  }

  async function onSaveAsClicked() {
    // your code to save as here
    props.saveItemCallback();
    return;
  }

  async function onDeleteClicked() {
    // don't call delete in Create mode
    if (!props.isDeleteEnabled) {
      return;
    }

    const msgBoxResult: string = await callDialogOpenMsgBox("Delete Item", "Are you sure about deleting this dashboard?", ["Yes", "No"], props.workloadClient);
    if (msgBoxResult != "Yes") {
      return;
    }

    props.deleteItemCallback();
  }

  function getSaveButtonTooltipText(): string {
    return !props.isDeleteEnabled
      ? 'Save is not supported in the Workloads view, which is outside of a Workspace.'
      : (!props.isLakeHouseSelected
        ? 'Select a Lakehouse'
        : 'Save');
  }

  return (
    <Toolbar>
      <Tooltip
        content={getSaveButtonTooltipText()}
        relationship="label">
        <ToolbarButton
          disabled={!props.isSaveButtonEnabled}
          aria-label="Save"
          icon={<Save24Regular />} onClick={onSaveAsClicked} 
        />
      </Tooltip>
      <Tooltip
        content="Select Datahub Lakehouse"
        relationship="label">
        <ToolbarButton
          aria-label="Save"
          icon={<Database24Regular />} onClick={() => onDatahubClicked()} 
        />
      </Tooltip>
      <Tooltip
        content="Settings"
        relationship="label">
        <ToolbarButton
          disabled={!props.itemObjectId}
          aria-label="Settings"
          icon={<Settings24Regular />} onClick={() => onSettingsClicked()} 
        />
      </Tooltip>
      <Tooltip
        content="Delete"
        relationship="label">
        <ToolbarButton
          aria-label="Delete"
          disabled={!props.isDeleteEnabled}
          icon={<Delete24Regular />}
          onClick={() => onDeleteClicked()} 
        />
      </Tooltip>
    </Toolbar>
  );
};

export interface RibbonProps extends IPageProps {
  saveItemCallback: () => void;
  isLakeHouseSelected?: boolean;
  isSaveButtonEnabled?: boolean;
  isDeleteEnabled?: boolean;
  deleteItemCallback: () => void;
  itemObjectId?: string;
  onTabChange: (tabValue: TabValue) => void;
};

export function Ribbon(props: RibbonProps) {
  const { onTabChange } = props;
  const [selectedValue, setSelectedValue] = React.useState<TabValue>('portfolio');

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
    onTabChange(data.value);
  };

  return (
    <div className="ribbon">
      <TabList defaultSelectedValue="portfolio" onTabSelect={onTabSelect}>
        <Tab value="portfolio">Portfolio</Tab>
        <Tab value="about">Architecture</Tab>
      </TabList>
      {["portfolio"].includes(selectedValue as string) && 
        <div className="toolbarContainer">
          <TabToolbar {...props} />
        </div>
      }
    </div>
  );
};
