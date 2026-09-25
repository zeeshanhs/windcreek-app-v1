export type CitationId = 1 | 2 | 3 | 4 | 5 | 6;

export type Citation = {
  id: CitationId;
  document: string;
  sheet: string;
  page: number;
  image: string;
  width: number;
  height: number;
};

const controlsDocument = "BAS-Niagara Wind Creek Casino HVAC Controls";

export const citations: Record<CitationId, Citation> = {
  1: { id: 1, document: controlsDocument, sheet: "Sheet 15 of 276, Casino BAS Network-4", page: 22, image: "/scenarios/ahu-15/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-22.jpg", width: 2550, height: 1650 },
  2: { id: 2, document: controlsDocument, sheet: "Sheet 6 of 276, BAS Network Switches Connectivity", page: 13, image: "/scenarios/ahu-15/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-13.jpg", width: 2550, height: 1650 },
  3: { id: 3, document: controlsDocument, sheet: "Sheet 141 of 276, AHU-15 Control Panel-1", page: 148, image: "/scenarios/ahu-15/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-148.jpg", width: 2550, height: 1650 },
  4: { id: 4, document: controlsDocument, sheet: "Sheet 143 of 276, AHU-15 Points List-1", page: 150, image: "/scenarios/ahu-15/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-150.jpg", width: 2550, height: 1650 },
  5: { id: 5, document: controlsDocument, sheet: "Sheet 268 of 276, Sequence of Operation-11 (AHU-7, 9–16 VAV)", page: 275, image: "/scenarios/ahu-15/BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-275.jpg", width: 2550, height: 1650 },
  6: { id: 6, document: "UPDATED M Series – Mechanical", sheet: "Sheet M0.29, Mechanical Schedules, Air Handling Unit Schedule", page: 30, image: "/scenarios/ahu-15/UPDATED_M_Series_-_Mechanical_page-30.jpg", width: 7200, height: 5400 },
};

export function citationByQuery(value: string | null): Citation | null {
  if (!value || !/^[1-6]$/.test(value)) return null;
  return citations[Number(value) as CitationId];
}

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "citation"; id: CitationId };

export type Block =
  | { kind: "paragraph"; content: Inline[] }
  | { kind: "ordered"; items: Inline[][] };

export type ScenarioMessage = {
  speaker: "Marcus" | "AskPat";
  time?: string;
  blocks: Block[];
};

const text = (value: string): Inline => ({ kind: "text", text: value });
const strong = (value: string): Inline => ({ kind: "strong", text: value });
const cite = (id: CitationId): Inline => ({ kind: "citation", id });
const paragraph = (...content: Inline[]): Block => ({ kind: "paragraph", content });
const ordered = (...items: Inline[][]): Block => ({ kind: "ordered", items });

export const messages: ScenarioMessage[] = [
  {
    speaker: "Marcus", time: "2:14 PM", blocks: [
      paragraph(text("AHU-15 isn't showing on the BMS screen. It was there this morning. Front desk says the 2nd floor offices are getting stuffy.")),
    ],
  },
  {
    speaker: "AskPat", blocks: [
      paragraph(text("Got it. AHU-15 is the PACE PAO-084X102 on the roof serving the 2nd Floor Offices. It is scheduled for 20,000 CFM supply with 3,900 CFM outside air, using a two-fan plug supply array and a two-fan plug return array "), cite(6), text(". On the controls side, AHU-15 is controller C019. It connects to the BAS network switch over CAT6 and runs an MS/TP trunk out to its supply fans, return fans, and the return, supply, and outdoor airflow stations "), cite(1), text(".")),
      paragraph(text("Before we go to the roof, one question: are AHU-14, AHU-16, or MAU-2 also missing from the BMS, or is it only AHU-15?")),
    ],
  },
  {
    speaker: "Marcus", time: "2:16 PM", blocks: [
      paragraph(text("Just 15. 14, 16 and MAU-2 all look normal.")),
    ],
  },
  {
    speaker: "AskPat", blocks: [
      paragraph(text("That points to a problem at C019 itself or its own cable, not a shared network outage. The 2nd floor BAS switches are SW8 in IDF Room 224 and SW9 in IDF Room 213A "), cite(2), text(". Since the neighboring units on the same floor are still reporting, a whole-switch failure is unlikely. One caveat: the network sheet labels AHU-15's uplink as \"Switch-X,\" so the drawings don't say which switch port it lands on "), cite(1), text(". If we get that far, IT will need to trace it.")),
      paragraph(text("First, rule out power, which is the more common cause. Go to the AHU-15 control panel. The drawing places the transformer in the AHU control panel, but it also flags that the panel may have been relocated to Electrical Room 217, so check there if you don't find it at the unit "), cite(3), text(".")),
      paragraph(text("When you open the panel, look at two things:")),
      ordered(
        [strong("The SOLA SDU500 UPS."), text(" It has four indicator lights: AC Input Normal, On Battery, Replace Battery/Overload, and Power. Tell me which ones are lit.")],
        [strong("The ECY-S1000 controller (C019)."), text(" Tell me whether its status lights are on.")],
      ),
      paragraph(text("The power path is 120 VAC from panel HR2A3, circuit 27, into the UPS, then through transformer TX1 (KEL-PSH500A, 500 VA). TX1 splits power into five switched circuits. The controllers are on HX1/GX1 at terminals 1-TSB and 3-TSB "), cite(3), text(".")),
    ],
  },
  {
    speaker: "Marcus", time: "2:31 PM", blocks: [
      paragraph(text("Found it at the unit. UPS has On Battery lit and Replace Battery is blinking. Controller is totally dark. Fans aren't running either.")),
    ],
  },
  {
    speaker: "AskPat", blocks: [
      paragraph(text("That's the answer. This is a power loss, not a network problem. The On Battery light means the UPS lost its 120 V feed from HR2A3-27 and ran on battery until the battery was drained, so C019 shut off. With C019 dark, the supply fan start command (DO101) and the return/exhaust fan start command (DO102) both dropped, which is why the fans stopped "), cite(4), text(".")),
      paragraph(text("Next steps:")),
      ordered(
        [text("Go to panel HR2A3 and check breaker 27. If it's tripped, reset it "), strong("once"), text(".")],
        [text("If it trips again, leave it off and call the electrician. A repeat trip means there's a fault on that circuit, and resetting it again won't fix it.")],
        [text("If the breaker holds, go back to the UPS and confirm AC Input Normal comes on.")],
        [text("Confirm the HX1 switch on TX1 is in the ON position "), cite(3), text(".")],
      ),
    ],
  },
  {
    speaker: "Marcus", time: "2:44 PM", blocks: [
      paragraph(text("Breaker 27 was tripped. Reset it and it's holding. UPS shows AC Input Normal now and the controller lights are coming up.")),
    ],
  },
  {
    speaker: "AskPat", blocks: [
      paragraph(text("Good. Give C019 a couple of minutes to boot, then check the BMS. You should see all C019 expansion modules responding, addresses 1 through 4 "), cite(4), text(".")),
      paragraph(text("When the unit gets its run command, it will start in this order, so don't read a slow start as a new fault:")),
      ordered(
        [text("Smoke dampers and fire/smoke dampers open.")],
        [text("After a 30-second delay, the supply fan is enabled.")],
        [text("The return fan is enabled once the supply fan is running "), cite(5), text(".")],
      ),
      paragraph(text("If it doesn't start, check for latched safeties. The low limit switch #1 (freeze stat) is manual reset, and its alarm stays active until an operator acknowledges it and resets it at the FMCS "), cite(5), text(".")),
    ],
  },
  {
    speaker: "Marcus", time: "2:52 PM", blocks: [
      paragraph(text("It's back on the BMS. Supply fans 1 and 2 running, return fans 1 and 2 running. But it's showing supply and return fans 3 and 4 as off. Is that a problem?")),
    ],
  },
  {
    speaker: "AskPat", blocks: [
      paragraph(text("Probably not. The network drawing shows four supply fans and four return fans on AHU-15's trunk "), cite(1), text(". The mechanical schedule only calls for two on each side "), cite(6), text(". Fans 3 and 4 are most likely unused placeholder points from the controls template. Walk the fan section to confirm there are physically only two fans per array. If so, I'll flag those points to controls support so they can be removed from the graphic.")),
    ],
  },
  {
    speaker: "Marcus", time: "2:55 PM", blocks: [
      paragraph(text("Confirmed only two fans each side. Go ahead and log it.")),
    ],
  },
  {
    speaker: "AskPat", blocks: [
      paragraph(text("Logged against AHU-15 with the three follow-ups attached.")),
    ],
  },
];

export const ticketSummary = "AHU-15 offline on BMS, resolved 2:52 PM. Root cause: loss of 120 V control power at HR2A3-27 (breaker tripped). The UPS ran until its battery was depleted and C019 shut off. Breaker reset once and held; controller and all modules back online; supply and return fans 1 and 2 confirmed running.";

export const followUps = [
  "Replace the SDU500 UPS battery; the Replace Battery light was blinking and it should have carried the controller longer",
  "Electrician to investigate if HR2A3-27 trips again; cause of the trip is unknown",
  "Controls support to remove unused fan 3 and 4 points from the AHU-15 graphic",
];
