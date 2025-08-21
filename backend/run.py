"""
Script for running nas locally
"""

import uvicorn
import os
from pathlib import Path
if __name__ == "__main__":
    # check directory
    os.chdir(Path(__file__).parent)

    print("Starting file server...")
    print("\n" + "="*50)

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
    