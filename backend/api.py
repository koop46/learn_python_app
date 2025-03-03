from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base
from fastapi.middleware.cors import CORSMiddleware
from db_schema import UserProgress
import uvicorn

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///backend/python_course.db" #change when deploying!!!
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Pydantic Schemas
class CodeSubmission(BaseModel):
    exercise_id: int
    user_id: str  # Matches String(36)
    code: str

class SubmissionResult(BaseModel):
    result: bool
    expected: str | None = None
    got: str | None = None

class UserProgressResponse(BaseModel):
    user_id: str
    exercise_id: int
    completed: bool
    input_data: str

    class Config:
        orm_mode = True  # Changed to from_attributes for newer Pydantic if needed
# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"],
    #     "http://frontend:80",
    #     "http://localhost",
    #     "http://localhost:80",
    #     "http://127.0.0.1",
    #     "http://127.0.0.1:80",
    #     "http://127.0.0.1",
    #     "http://127.0.0.1:5500",
    #     "http://localhost",
    #     "http://localhost:5500"
    # ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Endpoints
@app.get("/")
def health_check():
    return {"M10 AI": "Built this"}

# api.py (updated code snippet)
@app.get("/progress/{user_id}", response_model=list[UserProgressResponse])
def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.completed == True
    ).all()
    
    return [{
        "user_id": str(p.user_id),
        "exercise_id": p.exercise_id,
        "completed": p.completed,
        "input_data": p.input_data
    } for p in progress]



# Update the submit endpoint to always add new entries
@app.post("/submit", response_model=SubmissionResult)
def submit_code(submission: CodeSubmission, db: Session = Depends(get_db)):
    expected_output = exercises.get(submission.exercise_id, {}).get("expected_output", "Not implemented")
    
    try:
        result = evaluate_code(submission.code, submission.exercise_id)
        passed = result == expected_output
        
        if passed:
            # Check if entry already exists to avoid duplicates
            existing = db.query(UserProgress).filter(
                UserProgress.user_id == submission.user_id,
                UserProgress.exercise_id == submission.exercise_id
            ).first()
            
            if not existing:
                progress = UserProgress(
                    user_id=submission.user_id,
                    exercise_id=submission.exercise_id,
                    completed=True,
                    input_data=result
                )
                db.add(progress)  # Add new entry
                db.commit()

        return {
            "result": passed,
            "expected": expected_output if not passed else None,
            "got": result if not passed else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

    
# Hardcoded exercises for evaluation (since Exercise table is removed)
exercises = {
    1: {"expected_output": "Hello, world!"},
    2: {"expected_output": "87.3"},
    3: {"expected_output": "32.0"},
    4: {"expected_output": "120"},
    5: {"expected_output": "1.8333333333333333"},
    6: {"expected_output": "True"},
    7: {"expected_output": "alcohol"},
    8: {"expected_output": "True"},
    9: {"expected_output": "B"},
    10: {"expected_output": "B"},
    11: {"expected_output": "62.83185307179586"},
    12: {"expected_output": "1.5497677311665408"},
    13: {"expected_output": "2"},
    14: {"expected_output": "0.925"},
    15: {"expected_output": "Hello, Alice!"},
    16: {"expected_output": "<b>hello</b>"},
    17: {"expected_output": "6"},
    18: {"expected_output": "True"},
    19: {"expected_output": "[3, 4, 1, 2]"},
    20: {"expected_output": "[1, 3, 5]"},
    21: {"expected_output": "RAM"},
    22: {"expected_output": "ugetgv"},
    23: {"expected_output": "387"},
    24: {"expected_output": "{'hello': [0, 2], 'world': [1]}"},
    25: {"expected_output": "6"},
    26: {"expected_output": "{'user1': 'pass1', 'user2': 'pass2'}"},
    27: {"expected_output": "5"},
    28: {"expected_output": "True"},
    29: {"expected_output": "True"},
    30: {"expected_output": "True"},
    31: {"expected_output": "['app1']"},
    32: {"expected_output": "True"},
    33: {"expected_output": "'5/4'"},
    34: {"expected_output": "5"},
    35: {"expected_output": "10"},
    36: {"expected_output": "6"},
    37: {"expected_output": "2"},
    38: {"expected_output": "240"},
    39: {"expected_output": "True"},
    40: {"expected_output": "'Ace of Spades'"},
    41: {"expected_output": "'yellow'"},
    42: {"expected_output": "True"},
    43: {"expected_output": "2.0"},
    44: {"expected_output": "4000"},
    45: {"expected_output": "hi world"},
    46: {"expected_output": "'(1, 0)'"}
}

def evaluate_code(code: str, exercise_id: int) -> str:
    try:
        exec_globals = {}
        exec(code, exec_globals)
        func_name = [line.split('def ')[1].split('(')[0] for line in code.split('\n') if line.strip().startswith('def ')][-1]
        
        # Use test inputs from app.js (hardcoded here for simplicity)
        input_map = {
            1: "", 2: "90, 3", 3: "0", 4: "5", 5: "3", 6: "True, False", 7: "20", 8: "15, 20",
            9: "4", 10: "85", 11: "2, 5", 12: "10", 13: "0, 0, 2, 4, 1", 14: "0.5, 3.7",
            15: "'Alice'", 16: "'hello', 'b'", 17: "'abc'", 18: "[1, 2, 1]", 19: "[1, 2, 3, 4]",
            20: "2, [1, 2, 3, 4, 5]", 21: "'random access memory'", 22: "2, 'secret'",
            23: "[{'item': 'sugar', 'grams': 100}]", 24: "'hello world hello'", 25: "'1\\n2\\n3'",
            26: "'user1:pass1\\nuser2:pass2'", 27: "'101'", 28: "'user', 'pass'", 29: "[1, 2, 3, 4, 5, 6]",
            30: "5, 2", 31: "'app1'", 32: "(0, 1)", 33: "1, 2, 3, 4", 34: "5", 35: "5, 2",
            36: "48, 18", 37: "[1, 2, 3, 4, 5], 3", 38: "3, 1, '18:00'", 39: "'a' * 80",
            40: "'Ace', 'Spades'", 41: "50, 100, 1000", 42: "18", 43: "[1, 2, 3]", 44: "100000, 80000, 0.05",
            45: "'hello world', {'hello': 'hi'}", 46: "(1, 0)"
        }
        test_input = input_map.get(exercise_id, "")
        result = eval(f"{func_name}({test_input})", exec_globals)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)