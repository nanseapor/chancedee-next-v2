# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - heading "เป็นความผิดของเรา!" [level=2] [ref=e3]
    - paragraph [ref=e4]: เราต้องขออภัยในความไม่สะดวก ขณะนี้เกิดข้อผิดพลาดที่ไม่คาดคิดขึ้น
    - generic [ref=e5]:
      - button "ลองอีกครั้ง" [ref=e6]
      - button "กลับสู่หน้าหลัก" [ref=e7]
  - generic [ref=e12] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e13]:
      - img [ref=e14]
    - generic [ref=e17]:
      - button "Open issues overlay" [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: "0"
          - generic [ref=e21]: "1"
        - generic [ref=e22]: Issue
      - button "Collapse issues badge" [ref=e23]:
        - img [ref=e24]
  - alert [ref=e26]
```