## Goal:

Implement a chat scenario with pre-rendered information using the following back and forth between the human and the agent: `/Users/zeeshanhs/Documents/Developments/Javascript/windcreek-app-v1/_PROJECT/tasks/WCAP-002/inputs/AskPat Scenario AHU-15 Drops Off the BMS (US-09).md`.

**Citations Folder**:

The following folder contains the JPEG images of each citation page, allowing for an easy reference. Citations folder: `/Users/zeeshanhs/Documents/Developments/Javascript/windcreek-app-v1/_PROJECT/tasks/WCAP-002/inputs/citations`.

Under the `**Citations**` section of the scenario sheet, we have a table that maps each reference to a page of one of the PDFs.

Page to citation mapping:

| \#    | Document                                    | Sheet                                                         | PDF page | Used for                                                                               | Reference Page File                                                                                                                     |
| :---- | :------------------------------------------ | :------------------------------------------------------------ | :------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| \[1\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 15 of 276, Casino BAS Network-4                         | 22       | C019 identity, CAT6 uplink to "Switch-X", MS/TP trunk to 4+4 fans and airflow stations | [BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-22.jpg](./inputs/citations/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-22.jpg)   |
| \[2\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 6 of 276, BAS Network Switches Connectivity             | 13       | 2nd floor switches SW8 (IDF Room 224\) and SW9 (IDF Room 213A)                         | [BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-13.jpg](./inputs/citations/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-13.jpg)   |
| \[3\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 141 of 276, AHU-15 Control Panel-1                      | 148      | Power path HR2A3-27, SDU500 UPS lights, TX1 circuits, Electrical Room 217 note         | [BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-148.jpg](./inputs/citations/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-148.jpg) |
| \[4\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 143 of 276, AHU-15 Points List-1                        | 150      | Module addresses, DO101 and DO102 fan start commands                                   | [BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-150.jpg](./inputs/citations/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-150.jpg) |
| \[5\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 268 of 276, Sequence of Operation-11 (AHU-7, 9–16 VAV)  | 275      | Start sequence, 30-second delay, manual reset low limit                                | [BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-275.jpg](./inputs/citations/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-275.jpg) |
| \[6\] | UPDATED M Series – Mechanical (drawing)     | Sheet M0.29, Mechanical Schedules, Air Handling Unit Schedule | 30       | Model PAO-084X102, 2nd Floor Offices, 20,000 / 3,900 CFM, 2 fans per array             | [UPDATED*M_Series*-\_Mechanical_page-30.jpg](./inputs/citations/UPDATED_M_Series_-_Mechanical_page-30.jpg)                              |

When user clicks a citation, we want it to open in document viewer where they can zoom in and out to read the document. (**Important Note**: No highlighting of any text in citation, we only show you the full page, we do not highlight the sections within the page from where the information was used)

AI responses should be well-rendered markdowns. (no markdown code in AI response).

---

## Acceptance Criteria:

- The scenario is pre-loaded into the UI/UX
- Previewable on both Desktop version and Mobile version. Document viewer optimized for vieweing on mobile.
- No highlighting of any kind in citation images.
- User can click open a citation in-line and see the respective cited page in document-viewer.
