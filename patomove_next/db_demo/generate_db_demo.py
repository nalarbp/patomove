#!/usr/bin/env python3
"""
Generate demo database JSON for Patomove genomic intelligence platform.
Creates realistic demo data for 500 isolates with all related entities.
"""

import json
import uuid
import random
import requests
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import argparse

class DemoDataGenerator:
    def __init__(self, num_isolates: int = 500, populate_db: bool = False, base_url: str = "http://localhost:3000/api"):
        self.num_isolates = num_isolates
        self.num_patients = min(50, num_isolates // 4)  # 1 patient per 4-10 isolates
        self.num_environments = 10
        self.timestamp = datetime.now().isoformat()
        self.populate_db = populate_db
        self.base_url = base_url
        
        # Track created IDs for database population
        self.created_org_ids = []
        self.created_patient_ids = []
        self.created_environment_ids = []
        self.created_phenotype_ids = []
        self.created_isolate_ids = []
        self.created_genomic_ids = []
        
        # Reference data
        self.collection_sites = [
            "blood", "urine", "wound", "sputum", "CSF", "stool", 
            "throat", "nasal", "skin", "catheter", "abscess", "bile"
        ]
        self.priorities = ["normal", "priority"]
        self.statuses = ["to be sequenced", "genome sequenced", "genomics processing", "genomics completed"]
        self.species_list = [
            "Escherichia coli", "Klebsiella pneumoniae", "Staphylococcus aureus",
            "Enterococcus faecium", "Acinetobacter baumannii", "Pseudomonas aeruginosa",
            "Enterobacter cloacae", "Streptococcus pneumoniae"
        ]
        self.antibiotics = [
            "ampicillin", "ceftriaxone", "ciprofloxacin", "vancomycin", 
            "meropenem", "gentamicin", "clindamycin", "doxycycline"
        ]
        self.facility_types = [
            "hospital_ward", "ICU", "emergency_dept", "outpatient_clinic",
            "laboratory", "pharmacy", "food_service", "waste_management"
        ]
        
    def generate_uuid(self) -> str:
        return str(uuid.uuid4())
    
    def random_date_last_6_months(self, index: int = 0) -> str:
        """Generate dates spread over last 6 months"""
        base_date = datetime.now() - timedelta(days=180)
        days_offset = (index % 180) + random.randint(0, 10)
        date = base_date + timedelta(days=days_offset)
        return date.isoformat()
    
    def post_to_api(self, endpoint: str, data: Dict[str, Any]) -> Optional[str]:
        """Post data to API endpoint and return created ID"""
        if not self.populate_db:
            return None
            
        try:
            response = requests.post(f"{self.base_url}/{endpoint}", 
                                   json=data, 
                                   timeout=10)
            response.raise_for_status()
            result = response.json()
            return result.get('id')
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to create {endpoint}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response: {e.response.text}")
            return None
    
    def check_server(self) -> bool:
        """Check if the server is running"""
        if not self.populate_db:
            return True
            
        try:
            response = requests.get(f"{self.base_url}/organizations", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def generate_organizations(self) -> List[Dict[str, Any]]:
        """Generate 2 organizations: 1 pathlab, 1 hospital"""
        timestamp_suffix = str(int(datetime.now().timestamp()))
        
        organizations = [
            {
                "id": self.generate_uuid(),
                "name": "Central Pathology Lab",
                "type": "pathlab", 
                "code": f"CPL{timestamp_suffix}",
                "isInternal": True,
                "contactEmail": "admin@centralpath.com",
                "contactPhone": "+1-555-0101",
                "address": "123 Medical Center Dr, Health City, HC 12345",
                "accessLevel": "admin",
                "isActive": True
            },
            {
                "id": self.generate_uuid(),
                "name": "Metro Hospital",
                "type": "hospital",
                "code": f"MH{timestamp_suffix}",
                "isInternal": False,
                "contactEmail": "lab@metrohospital.com", 
                "contactPhone": "+1-555-0202",
                "address": "456 Hospital Ave, Metro City, MC 67890",
                "accessLevel": "viewer",
                "isActive": True
            }
        ]
        
        # Populate database if requested
        if self.populate_db:
            print("📤 Creating organizations...")
            for org in organizations:
                org_data = {k: v for k, v in org.items() if k != 'id'}  # Remove generated ID
                created_id = self.post_to_api("organizations", org_data)
                if created_id:
                    org['id'] = created_id  # Use actual created ID
                    self.created_org_ids.append(created_id)
                else:
                    print("❌ Failed to create organization, aborting...")
                    sys.exit(1)
            print(f"✅ Created {len(self.created_org_ids)} organizations")
        
        return organizations
    
    def generate_environments(self, org_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate environmental sampling sites"""
        environments = []
        
        for i in range(self.num_environments):
            env_data = {
                "id": self.generate_uuid(),
                "siteName": f"Environmental Site {i+1:02d}",
                "facilityType": random.choice(self.facility_types),
                "orgId": random.choice(org_ids)
            }
            environments.append(env_data)
        
        # Populate database if requested
        if self.populate_db:
            print("📤 Creating environments...")
            for env in environments:
                env_data = {k: v for k, v in env.items() if k != 'id'}
                created_id = self.post_to_api("environments", env_data)
                if created_id:
                    env['id'] = created_id
                    self.created_environment_ids.append(created_id)
            print(f"✅ Created {len(self.created_environment_ids)} environments")
        
        return environments
    
    def generate_patients(self, org_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate patients with realistic demographics"""
        patients = []
        
        for i in range(self.num_patients):
            # Random age between 0-90 years
            age_days = random.randint(0, 90 * 365)
            date_of_birth = datetime.now() - timedelta(days=age_days)
            
            patient_data = {
                "id": self.generate_uuid(),
                "dateOfBirth": date_of_birth.isoformat() if random.random() > 0.1 else None,
                "sex": random.choice(["M", "F"]),
                "clinicalNotes": f"Demo patient {i+1:03d} - {random.choice(['routine screening', 'infection workup', 'post-surgical monitoring', 'chronic condition'])}",
                "orgId": random.choice(org_ids)
            }
            patients.append(patient_data)
        
        # Populate database if requested
        if self.populate_db:
            print("📤 Creating patients...")
            for patient in patients:
                patient_api_data = {k: v for k, v in patient.items() if k != 'id'}
                created_id = self.post_to_api("patients", patient_api_data)
                if created_id:
                    patient['id'] = created_id
                    self.created_patient_ids.append(created_id)
                if len(self.created_patient_ids) % 10 == 0:
                    print(f"  Created {len(self.created_patient_ids)}/{self.num_patients} patients...")
            print(f"✅ Created {len(self.created_patient_ids)} patients")
        
        return patients
    
    def generate_patient_adts(self, patient_ids: List[str], org_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate admission/discharge/transfer records"""
        adts = []
        
        # Generate 1-3 ADT records per patient
        for patient_id in patient_ids:
            num_admissions = random.randint(1, 3)
            
            for admission in range(num_admissions):
                admit_date = datetime.now() - timedelta(days=random.randint(1, 180))
                discharge_date = None
                
                if random.random() > 0.3:  # 70% discharged
                    discharge_date = admit_date + timedelta(days=random.randint(1, 30))
                
                adts.append({
                    "id": self.generate_uuid(),
                    "patientId": patient_id,
                    "orgId": random.choice(org_ids),
                    "admitDate": admit_date.isoformat(),
                    "dischargeDate": discharge_date.isoformat() if discharge_date else None,
                    "transferType": random.choice(["admission", "transfer", "discharge"]) if discharge_date else "admission",
                    "ward": f"Ward {random.choice(['A', 'B', 'C', 'ICU', 'ER'])}{random.randint(1, 9)}",
                    "bed": f"Bed {random.randint(1, 30):02d}",
                    "notes": f"ADT record {admission + 1} for admission #{admission + 1}"
                })
        
        return adts
    
    def generate_phenotype_profiles(self) -> List[Dict[str, Any]]:
        """Generate antimicrobial susceptibility test profiles"""
        profiles = []
        
        # Generate 1 profile per 2-3 isolates (not all isolates have AST)
        num_profiles = self.num_isolates // 3
        
        for i in range(num_profiles):
            # Generate MIC data as JSON string
            mic_data = []
            num_antibiotics = random.randint(3, 8)
            tested_antibiotics = random.sample(self.antibiotics, num_antibiotics)
            
            for antibiotic in tested_antibiotics:
                mic_value = random.choice([0.5, 1, 2, 4, 8, 16, 32, 64, 128])
                interpretation = "R" if mic_value >= 16 else ("I" if mic_value >= 4 else "S")
                
                mic_data.append({
                    "antibiotic": antibiotic,
                    "mic": mic_value,
                    "interpretation": interpretation
                })
            
            profile_data = {
                "id": self.generate_uuid(),
                "species": random.choice(self.species_list),
                "method": random.choice(["VITEK2", "MicroScan", "broth_microdilution", "disk_diffusion"]),
                "testDate": self.random_date_last_6_months(i),
                "confidence": round(random.uniform(0.85, 0.99), 3),
                "notes": f"AST profile {i+1} - {random.choice(['standard panel', 'extended panel', 'targeted testing'])}",
                "micData": json.dumps(mic_data)
            }
            profiles.append(profile_data)
        
        # Populate database if requested  
        if self.populate_db:
            print("📤 Creating phenotype profiles...")
            for profile in profiles:
                profile_api_data = {k: v for k, v in profile.items() if k != 'id'}
                created_id = self.post_to_api("phenotypes", profile_api_data)
                if created_id:
                    profile['id'] = created_id
                    self.created_phenotype_ids.append(created_id)
            print(f"✅ Created {len(self.created_phenotype_ids)} phenotype profiles")
        
        return profiles
    
    def generate_isolates(self, org_ids: List[str], patient_ids: List[str], 
                         environment_ids: List[str], phenotype_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate isolate records with realistic distribution"""
        isolates = []
        
        for i in range(self.num_isolates):
            isolate_id = self.generate_uuid()
            
            # 75% human, 25% environmental
            if i % 4 == 0:  # Environmental
                sample_type = "environmental"
                collection_source = "environmental"
                patient_id = None
                environment_id = random.choice(environment_ids)
            else:  # Human
                sample_type = "clinical"
                collection_source = "clinical" 
                patient_id = random.choice(patient_ids)
                environment_id = None
            
            # Some isolates have phenotype profiles
            phenotype_id = random.choice(phenotype_ids) if phenotype_ids and random.random() > 0.6 else None
            
            isolate_data = {
                "id": isolate_id,
                "label": f"ISO-{i+1:04d}",
                "sampleType": sample_type,
                "phenotypeId": phenotype_id,
                "collectionSource": collection_source,
                "patientId": patient_id,
                "environmentId": environment_id,
                "orgId": random.choice(org_ids),
                "collectionSite": random.choice(self.collection_sites),
                "collectionDate": self.random_date_last_6_months(i),
                "priority": random.choice(self.priorities),
                "processingStatus": random.choice(self.statuses),
                "notes": f"Demo isolate {i+1} - {random.choice(['routine culture', 'surveillance', 'outbreak investigation', 'clinical isolate'])}"
            }
            isolates.append(isolate_data)
        
        # Populate database if requested
        if self.populate_db:
            print("📤 Creating isolates...")
            for i, isolate in enumerate(isolates):
                isolate_api_data = {k: v for k, v in isolate.items() if k != 'id'}
                created_id = self.post_to_api("isolates", isolate_api_data)
                if created_id:
                    isolate['id'] = created_id
                    self.created_isolate_ids.append(created_id)
                
                # Progress indicator
                if (i + 1) % 5 == 0 or (i + 1) == len(isolates):
                    print(f"  Created {len(self.created_isolate_ids)}/{len(isolates)} isolates...")
            print(f"✅ Created {len(self.created_isolate_ids)} isolates")
        
        return isolates
    
    def generate_genomic_data(self, isolate_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate genome files for the new GenomicData schema"""
        genomic_data = []
        
        # Generate some demo genome files (20% of isolates have genomes)
        # This simulates uploaded FASTA files waiting to be linked
        num_genomes = max(5, int(len(isolate_ids) * 0.2))
        
        for i in range(num_genomes):
            # Generate realistic filenames that might match isolate labels
            if i < len(isolate_ids) and random.random() > 0.3:
                # 70% chance to create filename that matches an isolate 
                isolate_index = i % len(isolate_ids)
                base_filename = f"ISO-{isolate_index+1:04d}"
            else:
                # 30% chance for unmatched filenames
                base_filename = random.choice([
                    f"genome_{i+1:03d}",
                    f"sample_{random.randint(100, 999)}",
                    f"EC{random.randint(1, 100):03d}",
                    f"SA{random.randint(1, 50):03d}",
                    f"KP{random.randint(1, 75):03d}"
                ])
            
            filename = f"{base_filename}.fasta"
            file_size = random.randint(1024*1024, 10*1024*1024)  # 1-10MB
            upload_date = self.random_date_last_6_months(i)
            
            genomic_data.append({
                "id": self.generate_uuid(),
                "filename": f"{self.generate_uuid()}_{filename}",  # Storage filename
                "originalFilename": filename,                      # User's filename
                "storagePath": f"/storage/genomes/{self.generate_uuid()}_{filename}",
                "fileSize": file_size,
                "fileHash": f"sha256_{random.randint(100000, 999999):x}{random.randint(100000, 999999):x}",
                "uploadDate": upload_date,
                
                #linking tracking fields (initially unlinked)
                "linkedAt": None,
                "autoLinked": False,
                "linkingMethod": None,
                
                #validation and processing
                "validationStatus": random.choice(["valid", "valid", "valid", "pending", "invalid"]),  # Mostly valid
                "processingStatus": random.choice(["uploaded", "validated", "analyzing", "completed"]),
                "validationErrors": None,
                
                #quality metrics (for valid genomes)
                "contigCount": random.randint(1, 150) if random.random() > 0.2 else None,
                "totalLength": random.randint(2000000, 8000000) if random.random() > 0.2 else None,
                "n50": random.randint(10000, 500000) if random.random() > 0.2 else None,
                "gcContent": round(random.uniform(35.0, 65.0), 2) if random.random() > 0.2 else None,
                "qualityMetrics": json.dumps({
                    "num_contigs": random.randint(1, 150),
                    "largest_contig": random.randint(50000, 2000000),
                    "total_length": random.randint(2000000, 8000000)
                }) if random.random() > 0.3 else None,
                
                #analysis results (for completed genomes)
                "sequencingPlatform": random.choice(["Illumina_MiSeq", "Illumina_NextSeq", "ONT_MinION", "PacBio_Sequel"]) if random.random() > 0.4 else None,
                "assemblyStats": json.dumps({
                    "assembler": random.choice(["SPAdes", "SKESA", "Unicycler"]),
                    "version": f"v{random.randint(3, 4)}.{random.randint(0, 15)}.{random.randint(0, 3)}"
                }) if random.random() > 0.5 else None,
                "mlstScheme": random.choice(["ecoli", "saureus", "kpneumoniae"]) if random.random() > 0.6 else None,
                "mlstType": f"ST{random.randint(1, 500)}" if random.random() > 0.6 else None,
                "mlstAlleles": json.dumps({
                    "adk": random.randint(1, 100),
                    "fumC": random.randint(1, 100),
                    "gyrB": random.randint(1, 100)
                }) if random.random() > 0.7 else None,
                "resistanceGenes": json.dumps([
                    {"gene": random.choice(["blaTEM", "blaCTX-M", "aac(6')-Ib", "sul1", "tet(A)"]), 
                     "identity": round(random.uniform(95, 100), 2)}
                    for _ in range(random.randint(0, 5))
                ]) if random.random() > 0.5 else None,
                "virulenceGenes": json.dumps([
                    {"gene": f"vir_{random.randint(1, 50)}", 
                     "identity": round(random.uniform(90, 100), 2)}
                    for _ in range(random.randint(0, 3))
                ]) if random.random() > 0.7 else None,
                "plasmids": json.dumps([
                    f"plasmid_{random.randint(1, 10)}"
                    for _ in range(random.randint(0, 3))
                ]) if random.random() > 0.8 else None,
                "speciesIdentification": random.choice(self.species_list) if random.random() > 0.3 else None,
                "speciesConfidence": round(random.uniform(0.85, 0.99), 3) if random.random() > 0.3 else None,
                
                #pipeline tracking
                "assemblyPath": f"/pipeline/assemblies/{base_filename}_processed.fasta" if random.random() > 0.4 else None,
                "annotationPath": f"/pipeline/annotations/{base_filename}.gff" if random.random() > 0.6 else None,
                "analysisCompleted": random.random() > 0.4,
                "pipelineJobId": f"job_{random.randint(10000, 99999)}" if random.random() > 0.5 else None,
                
                #audit fields
                "uploadedBy": random.choice(["user_001", "user_002", "user_003"]),
                "createdBy": random.choice(["system", "user_001"]),
                "updatedBy": random.choice(["system", "pipeline"]) if random.random() > 0.5 else None,
                "notes": f"Demo genome {i+1} - {random.choice(['clinical isolate', 'surveillance sample', 'outbreak investigation', 'quality control'])}"
            })
        
        # Populate database if requested  
        if self.populate_db:
            print("📤 Creating genomic data...")
            for genome in genomic_data:
                genome_api_data = {k: v for k, v in genome.items() if k != 'id'}
                created_id = self.post_to_api("genomics", genome_api_data)
                if created_id:
                    genome['id'] = created_id
                    self.created_genomic_ids.append(created_id)
            print(f"✅ Created {len(self.created_genomic_ids)} genomic data records")
        
        return genomic_data
    
    def generate_treatment_outcomes(self, isolate_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate clinical treatment outcome data"""
        outcomes = []
        
        # 40% of isolates have treatment outcome data
        treated_isolates = random.sample(isolate_ids, int(len(isolate_ids) * 0.4))
        
        for i, isolate_id in enumerate(treated_isolates):
            # 1-3 treatments per isolate
            num_treatments = random.randint(1, 3)
            
            for treatment in range(num_treatments):
                start_date = datetime.now() - timedelta(days=random.randint(1, 120))
                end_date = start_date + timedelta(days=random.randint(3, 21))
                
                outcomes.append({
                    "id": self.generate_uuid(),
                    "isolateId": isolate_id,
                    "antibiotic": random.choice(self.antibiotics),
                    "startDate": start_date.isoformat(),
                    "endDate": end_date.isoformat() if random.random() > 0.2 else None,
                    "outcome": random.choice(["cured", "improved", "failed", "discontinued", "ongoing"]),
                    "clinicalNotes": f"Treatment {treatment + 1} - {random.choice(['standard dosing', 'high dose', 'combination therapy', 'step-down therapy'])}"
                })
        
        return outcomes
    
    def generate_protein_refs(self) -> List[Dict[str, Any]]:
        """Generate protein reference data"""
        proteins = []
        
        # Generate 100 common proteins
        protein_functions = [
            "beta-lactamase", "efflux pump", "ribosomal protein", "DNA polymerase",
            "transcriptional regulator", "membrane protein", "adhesin", "toxin",
            "chaperone", "protease", "kinase", "phosphatase"
        ]
        
        categories = ["resistance", "virulence", "metabolism", "structure", "regulation"]
        
        for i in range(100):
            proteins.append({
                "uniprotId": f"P{i+10000:05d}",
                "name": f"{random.choice(protein_functions)}_{i+1}",
                "function": random.choice(protein_functions),
                "sequenceHash": f"hash_{random.randint(100000, 999999):x}",
                "category": random.choice(categories)
            })
        
        return proteins
    
    def generate_users(self, org_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate user accounts"""
        users = []
        
        user_names = [
            ("John", "Smith"), ("Jane", "Doe"), ("Michael", "Johnson"), 
            ("Sarah", "Wilson"), ("David", "Brown"), ("Lisa", "Davis")
        ]
        
        roles = ["admin", "analyst", "viewer", "technician"]
        
        for i, (first, last) in enumerate(user_names):
            users.append({
                "id": self.generate_uuid(),
                "email": f"{first.lower()}.{last.lower()}@demo.com",
                "firstName": first,
                "lastName": last,
                "orgId": random.choice(org_ids),
                "role": random.choice(roles),
                "permissions": json.dumps(["read", "write"] if random.random() > 0.5 else ["read"]),
                "isActive": True,
                "authProvider": "local",
                "authProviderId": f"auth_{i+1:03d}"
            })
        
        return users
    
    def generate_demo_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate complete demo dataset"""
        if self.populate_db:
            print(f"🧬 Generating and populating database with {self.num_isolates} isolates...")
            
            # Check server connectivity
            if not self.check_server():
                print("❌ Server not running! Please start with 'npm run dev' first.")
                sys.exit(1)
            print("✅ Server is running")
        else:
            print(f"🧬 Generating demo data for {self.num_isolates} isolates...")
        
        # Generate in dependency order (tables with no foreign keys first)
        organizations = self.generate_organizations()
        org_ids = self.created_org_ids if self.populate_db else [org["id"] for org in organizations]
        
        environments = self.generate_environments(org_ids)
        environment_ids = self.created_environment_ids if self.populate_db else [env["id"] for env in environments]
        
        patients = self.generate_patients(org_ids)
        patient_ids = self.created_patient_ids if self.populate_db else [patient["id"] for patient in patients]
        
        patient_adts = self.generate_patient_adts(patient_ids, org_ids)
        
        phenotype_profiles = self.generate_phenotype_profiles()
        phenotype_ids = self.created_phenotype_ids if self.populate_db else [profile["id"] for profile in phenotype_profiles]
        
        isolates = self.generate_isolates(org_ids, patient_ids, environment_ids, phenotype_ids)
        isolate_ids = [isolate["id"] for isolate in isolates]
        
        genomic_data = self.generate_genomic_data(isolate_ids)
        treatment_outcomes = self.generate_treatment_outcomes(isolate_ids)
        protein_refs = self.generate_protein_refs()
        users = self.generate_users(org_ids)
        
        return {
            "organizations": organizations,
            "environments": environments,
            "patients": patients,
            "patientAdts": patient_adts,
            "phenotypeProfiles": phenotype_profiles,
            "isolates": isolates,
            "genomicData": genomic_data,
            "treatmentOutcomes": treatment_outcomes,
            "proteinRefs": protein_refs,
            "users": users,
            "metadata": {
                "generated_at": self.timestamp,
                "num_isolates": self.num_isolates,
                "num_patients": self.num_patients,
                "num_organizations": len(organizations),
                "num_environments": len(environments)
            }
        }

def main():
    parser = argparse.ArgumentParser(description="Generate Patomove demo database JSON and optionally populate database")
    parser.add_argument("--isolates", "-i", type=int, default=500, 
                       help="Number of isolates to generate (default: 500)")
    parser.add_argument("--output", "-o", type=str, default="demo_db.json",
                       help="Output JSON file (default: demo_db.json)")
    parser.add_argument("--populate", "-p", action="store_true",
                       help="Populate database directly via API (requires server running)")
    parser.add_argument("--url", type=str, default="http://localhost:3000/api",
                       help="API base URL (default: http://localhost:3000/api)")
    
    args = parser.parse_args()
    
    generator = DemoDataGenerator(
        num_isolates=args.isolates, 
        populate_db=args.populate,
        base_url=args.url
    )
    demo_data = generator.generate_demo_data()
    
    # Write to JSON file
    with open(args.output, 'w') as f:
        json.dump(demo_data, f, indent=2)
    
    if args.populate:
        print(f"🎉 Database populated successfully!")
        print(f"📊 Summary:")
        print(f"   - {len(generator.created_org_ids)} Organizations created in DB")
        print(f"   - {len(generator.created_patient_ids)} Patients created in DB")
        print(f"   - {len(generator.created_environment_ids)} Environments created in DB")  
        print(f"   - {len(generator.created_phenotype_ids)} Phenotype profiles created in DB")
        print(f"   - {len(generator.created_isolate_ids)} Isolates created in DB")
        print(f"   - {len(generator.created_genomic_ids)} Genomic data records created in DB")
        print(f"   - Database contains demo data for genome linking testing")
    else:
        print(f"✅ Demo data generated successfully!")
        print(f"📊 Summary:")
        print(f"   - {len(demo_data['organizations'])} Organizations")
        print(f"   - {len(demo_data['patients'])} Patients") 
        print(f"   - {len(demo_data['isolates'])} Isolates")
        print(f"   - {len(demo_data['genomicData'])} Genomic records")
        print(f"   - {len(demo_data['phenotypeProfiles'])} Phenotype profiles")
        print(f"   - {len(demo_data['treatmentOutcomes'])} Treatment outcomes")
        print(f"   - {len(demo_data['users'])} Users")
    
    print(f"📄 JSON output: {args.output}")

if __name__ == "__main__":
    main()