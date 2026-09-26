from datetime import datetime
from typing import List, Dict, Any
import uuid
from app.schemas import CitizenSOS, CrowdFloodReport

class NotificationAndEmergencyService:
    def __init__(self):
        # In-memory storage for hackathon runtime demo
        self.sos_requests: List[Dict[str, Any]] = [
            {
                "id": "SOS_9901",
                "citizen_name": "Rajesh Sharma",
                "phone_number": "+91-98201-44512",
                "lat": 19.0695,
                "lng": 72.8780,
                "ward_name": "Kurla West",
                "num_people_stranded": 4,
                "water_level_description": "Waist-Deep (1.1m)",
                "medical_emergency": True,
                "notes": "Elderly patient needing oxygen cylinder assistance. Ground floor flooded.",
                "timestamp": "10 mins ago",
                "status": "TEAM_EN_ROUTE"
            },
            {
                "id": "SOS_9902",
                "citizen_name": "Ananya Sundaram",
                "phone_number": "+91-94440-12890",
                "lat": 12.9765,
                "lng": 80.2220,
                "ward_name": "Velachery",
                "num_people_stranded": 2,
                "water_level_description": "Neck/Roof (1.8m)",
                "medical_emergency": False,
                "notes": "Stranded on terrace, inverter power failing.",
                "timestamp": "4 mins ago",
                "status": "DISPATCH_PENDING"
            }
        ]

        self.crowd_reports: List[Dict[str, Any]] = [
            {
                "id": "RPT_101",
                "reporter_name": "Sunil V.",
                "lat": 19.0185,
                "lng": 72.8470,
                "location_name": "Hindmata Flyover Underpass",
                "water_depth_cm": 65.0,
                "road_traffic_status": "BLOCKED",
                "description": "Buses stranded, water rising rapidly towards engine level. Avoid this stretch.",
                "timestamp": "15 mins ago",
                "verified_votes": 12
            },
            {
                "id": "RPT_102",
                "reporter_name": "Karthik R.",
                "lat": 12.9270,
                "lng": 77.6750,
                "location_name": "Bellandur EcoSpace Service Road",
                "water_depth_cm": 45.0,
                "road_traffic_status": "SLOW",
                "description": "Two-wheelers broken down, slow crawling traffic in rightmost lane.",
                "timestamp": "8 mins ago",
                "verified_votes": 7
            }
        ]

    def add_sos(self, sos: CitizenSOS) -> Dict[str, Any]:
        sos_dict = sos.model_dump()
        sos_dict["id"] = f"SOS_{uuid.uuid4().hex[:4].upper()}"
        sos_dict["timestamp"] = "Just now"
        sos_dict["status"] = "DISPATCH_PENDING"
        self.sos_requests.insert(0, sos_dict)
        return sos_dict

    def get_all_sos(self) -> List[Dict[str, Any]]:
        return self.sos_requests

    def update_sos_status(self, sos_id: str, new_status: str) -> bool:
        for item in self.sos_requests:
            if item["id"] == sos_id:
                item["status"] = new_status
                return True
        return False

    def add_crowd_report(self, rpt: CrowdFloodReport) -> Dict[str, Any]:
        rpt_dict = rpt.model_dump()
        rpt_dict["id"] = f"RPT_{uuid.uuid4().hex[:4].upper()}"
        rpt_dict["timestamp"] = "Just now"
        rpt_dict["verified_votes"] = 1
        self.crowd_reports.insert(0, rpt_dict)
        return rpt_dict

    def get_all_reports(self) -> List[Dict[str, Any]]:
        return self.crowd_reports

notification_service = NotificationAndEmergencyService()
