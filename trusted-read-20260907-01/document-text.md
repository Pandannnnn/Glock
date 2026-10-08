# HACKATHON IMPORTANT DOCS

- Document ID: 1tsN9vhFIDkBLBZmWpg4Dmfg8vEisTrLEhp0mYY-Pj6Q
- Revision ID: ANLCKQntHoMDxMSWlJVS5zKB6W7N8T6jexTE9ZuDS6Jo_yUxylhpbYjQoNMzCdlfvhS7LvKpTwfQmZe0ae5JMllvaEObgK4nd4dUId5gkjQ
- Selected tab: all
- Protected controls: 0
- Opaque controls: 0
- Authoritative dropdowns: 0

Protected-control annotations are preservation instructions. Do not insert their displayed placeholder text to recreate a native control.

## Prompt Engineering Prompt (t.0)

[P00001 | 1:211 | NORMAL_TEXT]
I want to create a Mini GCash clone prototype app (just a webapp for now since Android Emulator is hassle to configure) with the following features: It is called GLock which is basically an extension of Gcash.

[P00002 | 211:1524 | NORMAL_TEXT]
GLock acts a subwallet and planner system of Gcash for merchants. It must be enabled via the original Gcash tab called View More. Once enabled, the merchant must register their business first. They must input their business name and input their products with their corresponding stocks (can also be put in subcategories) and the input can be manual or via .csv file. For each subcategories of items, they must be able to choose if they will use the Forecast AI on these items or use VMI (Vendor Management Inventory) as a "forecasting method". Once they "register" on Glock, they will see a Merchant Dashboard. The current idea is that it will have five tabs: Overview, Products, Planner, Connected Businesses, and Radar. As a subwallet of Gcash, Glock will display the original balance in Gcash divided into Personal funds and Business funds in the Overview. For transactions, assume that the owner has a digitalized cashier: the new compact receipt will be formed by combining the usual gcash receipt with the order details fetched from the digitalized cashier. In order to do this, Glock must have a customized QR code for each transaction and in turn the payment will be added to the Business funds . The dashboard in turn should also be typical "merchant profile" with summaries of transactions and whatnot.

[P00003 | 1524:1771 | NORMAL_TEXT]
For the products, it will just be a list of the products the merchant entered with their corresponding stock and prices. Note that during a transaction, the system must automatically deduct the stock given the ordered products in the transaction.

[P00004 | 1771:2139 | NORMAL_TEXT]
For Connected Businesses, as I said earlier in the setup, the business can choose VMI or Forecast AI. If they choose VMI, they must connect to a Business that also uses GLock. So, in this Connected Businesses tab, for each of the business connected to them, they can set what they will allow to be bought in the inventory (so its basically a trading part of the app).

[P00005 | 2139:2772 | NORMAL_TEXT]
For the planner, this will only happen after a week of sales since there is insufficient data during the initial use of GLock. It will have two components: Adaptive Split, and Forecasting. For the Adaptive split, every day after their business hours, an AI model will suggest a split from their profit for today (Business/Personal) split. Now for the weekly forecasting, as mentioned earlier it has two parts: VMI and Forecasting AI. The general idea is based on the current BUSINESS balance, stocks, seasonal trends, and inventory the forecasting feature will suggest what should the seller buy. Let me explain first the two parts:

[P00006 | 2772:3307 | NORMAL_TEXT]
For items with Forecasting AI, the model must suggest the same suggestion but in three categories of SRP (lowest/average/highest). What i mean is for example if the suggestion of the AI is (5 product A, 2 product B), it must suggest it in different prices (product A: 56 pesos, product B: 40 pesos), (product A: 46 pesos, product B: 45 pesos), and if possible it can have suggestions on what stores you can buy. Essentially, we have three "forecast cards" that can be selected (one final card can only be selected) by the Forecast AI.

[P00007 | 3307:3493 | NORMAL_TEXT]
For VMI, we have "vendor cards". Clicking one of them will fetch the current available products listed by the vendor in the Connected Businesses tab that is fit to your current balance.

[P00008 | 3493:4097 | NORMAL_TEXT]
Now for the cards, each forecast card can be MODIFIED (like you can modify that list/number of items) and has a total price section. If you confirm OK on the card, the total price of the card will be "reserved". Meaning, for example, if you have a 5k BUSINESS balance, and you clicked OK on a 2k forecast AI, clicking on a VMI Forecast will only consider the remaining 3k BUSINESS balance. Additionally, if possible, if the current forecast is deemed insufficient by AI (due to small BUSINESS balance for example) there can be an option to either get money from personal funds or an option to use GLoan.

[P00009 | 4097:4599 | NORMAL_TEXT]
Now for the final part of the app which is GRadar, given the consent of merchants around the area on Glock, it is possible to see all the transaction details of those merchants. For data privacy, the only seen details are the Order details itself and the Time (what is bought and time). Now, GRadar can give the user a summary of what are the trends: For example it can say that "Many people buy chicken at 4-5 pm". Additionally, it can also give the User a supply and demand graph over time of items.

[P00010 | 4599:4710 | NORMAL_TEXT]
Note that GLock will be integrated with the GCash App so as much as possible we will be using the UI of GCash.

## #2 plenary sessions (t.6ns1uhhxirr7)

[P00011 | 1:188 | NORMAL_TEXT]
THE DATA DISRUPTOR - to shatter assumptions with raw data. drops an unexpected massive pr alarming statics that reorients the audience's view of the market. spark the fear of missing out

[P00012 | 188:189 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00013 | 189:290 | NORMAL_TEXT]
THE STORY TELLER - build immediate emotional investment, build authentic trust and human connections

[P00014 | 290:291 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00015 | 291:380 | NORMAL_TEXT]
THE PROVOCATEUR - to challenge industry status quo, to force active cognitive engagement

[P00016 | 380:381 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00017 | 381:472 | NORMAL_TEXT]
THE VISUALIZER - to make an abstract concept physical, to highlight a massive gap in value

[P00018 | 472:473 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00019 | 473:474 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00020 | 474:494 | NORMAL_TEXT]
business case frame

[P00021 | 494:518 | NORMAL_TEXT]
1. problem/opportunity 

[P00022 | 518:618 | NORMAL_TEXT]
    - target user and insights (who are we designing for? what do they need want or struggle with?)

[P00023 | 618:619 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00024 | 619:710 | NORMAL_TEXT]
-what pain point exists today, who is experiencing it, what is the cost of not solving it?

[P00025 | 710:711 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00026 | 711:740 | NORMAL_TEXT]
2. proposed solution/concept

[P00027 | 740:758 | NORMAL_TEXT]
value proposition

[P00028 | 758:787 | NORMAL_TEXT]
feasibility and requirements

[P00029 | 787:811 | NORMAL_TEXT]
business impact and ROI

[P00030 | 811:846 | NORMAL_TEXT]
competitive and benchmark insights

[P00031 | 846:867 | NORMAL_TEXT]
risks and mitigation

[P00032 | 867:868 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00033 | 868:1007 | NORMAL_TEXT]
-what innovations are you proposing? how does it solve the problem better than existing options? what make is unique feasible or scalable?

[P00034 | 1007:1008 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00035 | 1008:1043 | NORMAL_TEXT]
3. roadmap and implementation plan

[P00036 | 1043:1075 | NORMAL_TEXT]
how does this benefit the user?

[P00037 | 1075:1111 | NORMAL_TEXT]
how does this benefit the business?

[P00038 | 1111:1137 | NORMAL_TEXT]
why does this matter now?

[P00039 | 1137:1138 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00040 | 1138:1149 | NORMAL_TEXT]
4. the ask

[P00041 | 1149:1150 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00042 | 1150:1182 | NORMAL_TEXT]
5. feasibility and requirements

[P00043 | 1182:1231 | NORMAL_TEXT]
what tech, resources or partnerships are needed?

[P00044 | 1231:1269 | NORMAL_TEXT]
what are the dependencies of prereqs?

[P00045 | 1269:1313 | NORMAL_TEXT]
is it technically and operationally viable?

[P00046 | 1313:1314 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00047 | 1314:1341 | NORMAL_TEXT]
6. business impact and ROI

[P00048 | 1341:1377 | NORMAL_TEXT]
what financial metrics will improve

[P00049 | 1377:1407 | NORMAL_TEXT]
cost savings vs cost to build

[P00050 | 1407:1428 | NORMAL_TEXT]
timeline for payback

[P00051 | 1428:1458 | NORMAL_TEXT]
cost savings vs cost to build

[P00052 | 1458:1479 | NORMAL_TEXT]
timeline for payback

[P00053 | 1479:1480 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00054 | 1480:1518 | NORMAL_TEXT]
7. competitive and benchmark insights

[P00055 | 1518:1550 | NORMAL_TEXT]
what are other companies doing?

[P00056 | 1550:1608 | NORMAL_TEXT]
what makes your innovation better or more differentiated?

[P00057 | 1608:1609 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00058 | 1609:1633 | NORMAL_TEXT]
8. risks and mitigation

[P00059 | 1633:1671 | NORMAL_TEXT]
list key risks and show preparedness.

[P00060 | 1671:1672 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00061 | 1672:1707 | NORMAL_TEXT]
9. roadmap and implementation plan

[P00062 | 1707:1741 | NORMAL_TEXT]
phases (pilot build launch scale)

[P00063 | 1741:1758 | NORMAL_TEXT]
clear milestones

[P00064 | 1758:1780 | NORMAL_TEXT]
3-6-12 month outclock

## deep research (t.p2fbha52wxtn)

[P00065 | 1:150 | NORMAL_TEXT | LIST id=kix.tshc5ku068jx level=0]
GLock addresses a validated gap: micro firms represent 90.66% of Philippine establishments, while retail and food service dominate the MSME economy.

[P00066 | 150:356 | NORMAL_TEXT | LIST id=kix.tshc5ku068jx level=0]
Digital payments are mainstream, but business operations lag: 72.2% of person-initiated payments were digital in 2024, compared with 19.8% of business-initiated payments and 13.7% of B2B supplier payments.

[P00067 | 356:501 | NORMAL_TEXT | LIST id=kix.tshc5ku068jx level=0]
The recommended positioning is a bounded Micro-ERP connecting money, inventory, obligations, and replenishment—not a simplified SAP replacement.

[P00068 | 501:751 | NORMAL_TEXT | LIST id=kix.tshc5ku068jx level=0]
The realistic FMCG integration path starts with distributors and retailer-approved reorder recommendations. Autonomous VMI should follow only after catalog mapping, acknowledgements, partial fulfillment, returns, and reservation controls are proven.

[P00069 | 751:932 | NORMAL_TEXT | LIST id=kix.tshc5ku068jx level=0]
The report includes evidence grading, the Capital Guard formula, ledger architecture, VMI maturity model, feature economics, privacy controls for GRadar, and a 90-day pilot design.

[P00070 | 932:933 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00071 | 933:955 | NORMAL_TEXT]
[GLock Strategy Report](https://drive.google.com/file/d/1hJDbQtUZeeL07fxJLuiXraRL77pbtpPm/view?usp=drive_link)

