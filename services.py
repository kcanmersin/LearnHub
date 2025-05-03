# services.py
from fastapi import HTTPException, status
from mysql.connector import Error as MySQLError
from typing import Optional

from schemas import LanguageRequest, LLMResponse, User, UserQueryCreate, LLMResponseCreate
import crud
import llm

async def process_language_request(request: LanguageRequest, current_user: Optional[User] = None) -> LLMResponse:
    query_id = None
    try:
        user_query_data = UserQueryCreate(
            user_id=current_user.id if current_user else None,
            text=request.text,
            input_type=request.input_type
        )
        query_id = crud.save_user_query(user_query_data)
        if query_id is None:
            raise HTTPException(status_code=500, detail="Failed to save user query.")

        llm_response_data = await llm.get_llm_explanation(request.text, request.input_type)

        llm_db_data = LLMResponseCreate(
            query_id=query_id,
            explanation=llm_response_data.explanation,
            examples=llm_response_data.examples,
            usage_contexts=llm_response_data.usage_contexts
        )
        crud.save_llm_response(llm_db_data)

        return llm_response_data

    except ConnectionError as e:
        print(f"Service Error: Connection failed - {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except RuntimeError as e:
        print(f"Service Error: LLM processing failed - {e}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    except MySQLError as e:
        print(f"Service Error: Database operation failed - {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {e.msg}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in process_language_request: {e}")
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred.")