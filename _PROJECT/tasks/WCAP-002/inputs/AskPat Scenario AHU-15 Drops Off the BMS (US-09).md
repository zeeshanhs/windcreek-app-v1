# **AskPat Scenario: AHU-15 Drops Off the BMS**

## **Scenario overview**

AskPat traces an offline AHU-15 to a tripped control power breaker in 41 minutes, using 5 controls manual sheets and 1 mechanical drawing sheet.

| Field | Detail |
| :---- | :---- |
| Use case | US-09, Unit Shows Offline or Not Responding on the Building System |
| Entry point | Plain language symptom, reported through the building automation system |
| Actor | Marcus, maintenance technician, Wind Creek Chicago Southland, on his phone during the afternoon shift |
| Input | "AHU-15 isn't showing on the BMS screen." |
| Clarifying question | One: are nearby units also offline? (per US-09 policy) |
| Outcome | Power loss confirmed, not a network fault; unit restored and ticket logged |
| Sources | Precision Controls BAS shop drawings (Job C233914); SCB/IMEG Mechanical drawing set (M Series) |

## **The conversation**

**Marcus (2:14 PM):** AHU-15 isn't showing on the BMS screen. It was there this morning. Front desk says the 2nd floor offices are getting stuffy.

**AskPat:** Got it. AHU-15 is the PACE PAO-084X102 on the roof serving the 2nd Floor Offices. It is scheduled for 20,000 CFM supply with 3,900 CFM outside air, using a two-fan plug supply array and a two-fan plug return array \[6\]. On the controls side, AHU-15 is controller C019. It connects to the BAS network switch over CAT6 and runs an MS/TP trunk out to its supply fans, return fans, and the return, supply, and outdoor airflow stations \[1\].

Before we go to the roof, one question: are AHU-14, AHU-16, or MAU-2 also missing from the BMS, or is it only AHU-15?

**Marcus (2:16 PM):** Just 15\. 14, 16 and MAU-2 all look normal.

**AskPat:** That points to a problem at C019 itself or its own cable, not a shared network outage. The 2nd floor BAS switches are SW8 in IDF Room 224 and SW9 in IDF Room 213A \[2\]. Since the neighboring units on the same floor are still reporting, a whole-switch failure is unlikely. One caveat: the network sheet labels AHU-15's uplink as "Switch-X," so the drawings don't say which switch port it lands on \[1\]. If we get that far, IT will need to trace it.

First, rule out power, which is the more common cause. Go to the AHU-15 control panel. The drawing places the transformer in the AHU control panel, but it also flags that the panel may have been relocated to Electrical Room 217, so check there if you don't find it at the unit \[3\].

When you open the panel, look at two things:

1. **The SOLA SDU500 UPS.** It has four indicator lights: AC Input Normal, On Battery, Replace Battery/Overload, and Power. Tell me which ones are lit.  
2. **The ECY-S1000 controller (C019).** Tell me whether its status lights are on.

The power path is 120 VAC from panel HR2A3, circuit 27, into the UPS, then through transformer TX1 (KEL-PSH500A, 500 VA). TX1 splits power into five switched circuits. The controllers are on HX1/GX1 at terminals 1-TSB and 3-TSB \[3\].

**Marcus (2:31 PM):** Found it at the unit. UPS has On Battery lit and Replace Battery is blinking. Controller is totally dark. Fans aren't running either.

**AskPat:** That's the answer. This is a power loss, not a network problem. The On Battery light means the UPS lost its 120 V feed from HR2A3-27 and ran on battery until the battery was drained, so C019 shut off. With C019 dark, the supply fan start command (DO101) and the return/exhaust fan start command (DO102) both dropped, which is why the fans stopped \[4\].

Next steps:

1. Go to panel HR2A3 and check breaker 27\. If it's tripped, reset it **once**.  
2. If it trips again, leave it off and call the electrician. A repeat trip means there's a fault on that circuit, and resetting it again won't fix it.  
3. If the breaker holds, go back to the UPS and confirm AC Input Normal comes on.  
4. Confirm the HX1 switch on TX1 is in the ON position \[3\].

**Marcus (2:44 PM):** Breaker 27 was tripped. Reset it and it's holding. UPS shows AC Input Normal now and the controller lights are coming up.

**AskPat:** Good. Give C019 a couple of minutes to boot, then check the BMS. You should see all C019 expansion modules responding, addresses 1 through 4 \[4\].

When the unit gets its run command, it will start in this order, so don't read a slow start as a new fault:

1. Smoke dampers and fire/smoke dampers open.  
2. After a 30-second delay, the supply fan is enabled.  
3. The return fan is enabled once the supply fan is running \[5\].

If it doesn't start, check for latched safeties. The low limit switch \#1 (freeze stat) is manual reset, and its alarm stays active until an operator acknowledges it and resets it at the FMCS \[5\].

**Marcus (2:52 PM):** It's back on the BMS. Supply fans 1 and 2 running, return fans 1 and 2 running. But it's showing supply and return fans 3 and 4 as off. Is that a problem?

**AskPat:** Probably not. The network drawing shows four supply fans and four return fans on AHU-15's trunk \[1\]. The mechanical schedule only calls for two on each side \[6\]. Fans 3 and 4 are most likely unused placeholder points from the controls template. Walk the fan section to confirm there are physically only two fans per array. If so, I'll flag those points to controls support so they can be removed from the graphic.

**Marcus (2:55 PM):** Confirmed only two fans each side. Go ahead and log it.

**AskPat:** Logged against AHU-15 with the three follow-ups attached.

## **Ticket summary**

AHU-15 offline on BMS, resolved 2:52 PM. Root cause: loss of 120 V control power at HR2A3-27 (breaker tripped). The UPS ran until its battery was depleted and C019 shut off. Breaker reset once and held; controller and all modules back online; supply and return fans 1 and 2 confirmed running.

* ☐ Replace the SDU500 UPS battery; the Replace Battery light was blinking and it should have carried the controller longer  
* ☐ Electrician to investigate if HR2A3-27 trips again; cause of the trip is unknown  
* ☐ Controls support to remove unused fan 3 and 4 points from the AHU-15 graphic

## **Citations**

Five citations point to the controls manual and one to the mechanical drawing. In the controls manual, sheet number \+ 7 \= PDF page, because the cover and index pages come first.

| \# | Document | Sheet | PDF page | Used for |
| :---- | :---- | :---- | :---- | :---- |
| \[1\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 15 of 276, Casino BAS Network-4 | 22 | C019 identity, CAT6 uplink to "Switch-X", MS/TP trunk to 4+4 fans and airflow stations |
| \[2\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 6 of 276, BAS Network Switches Connectivity | 13 | 2nd floor switches SW8 (IDF Room 224\) and SW9 (IDF Room 213A) |
| \[3\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 141 of 276, AHU-15 Control Panel-1 | 148 | Power path HR2A3-27, SDU500 UPS lights, TX1 circuits, Electrical Room 217 note |
| \[4\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 143 of 276, AHU-15 Points List-1 | 150 | Module addresses, DO101 and DO102 fan start commands |
| \[5\] | BAS-Niagara Wind Creek Casino HVAC Controls | Sheet 268 of 276, Sequence of Operation-11 (AHU-7, 9–16 VAV) | 275 | Start sequence, 30-second delay, manual reset low limit |
| \[6\] | UPDATED M Series – Mechanical (drawing) | Sheet M0.29, Mechanical Schedules, Air Handling Unit Schedule | 30 | Model PAO-084X102, 2nd Floor Offices, 20,000 / 3,900 CFM, 2 fans per array |

## **Notes on the scenario**

Only the breaker trip and the timeline are invented. Every equipment detail comes straight from the documents: model, service area, airflows, fan counts, controller C019, circuit HR2A3-27, UPS lights, TX1 terminals, start sequence, and the "Switch-X" placeholder.

The fan count mismatch is a real discrepancy in the drawings. Sheet 15 shows four supply and four return fans on AHU-15, while M0.29 schedules two of each. The scenario uses it to show AskPat flagging a gap instead of guessing.