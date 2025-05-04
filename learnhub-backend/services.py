from fastapi import HTTPException, status
from mysql.connector import Error as MySQLError
from typing import Optional

from schemas import LanguageRequest, LLMResponse, User, UserQueryCreate, LLMResponseCreate, SaveWordRequest, UserQuery
import crud
import llm

async def get_explanation(request: LanguageRequest) -> LLMResponse:
    try:
        llm_response_data = await llm.get_llm_explanation(request.text, request.input_type)
        return llm_response_data
    except ConnectionError as e:
        print(f"Service Error: LLM Connection failed - {e}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except RuntimeError as e:
        print(f"Service Error: LLM processing failed - {e}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    except ValueError as e:
        print(f"Service Error: Invalid input type - {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in get_explanation: {e}")
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred while getting the explanation.")


async def save_explanation(request: SaveWordRequest, current_user: User) -> UserQuery:
    query_id = None
    try:
        user_query_data = UserQueryCreate(
            user_id=current_user.id,
            text=request.text,
            input_type=request.input_type,
            tag=request.tag
        )
        query_id = crud.save_user_query(user_query_data)
        if query_id is None:
            raise HTTPException(status_code=500, detail="Failed to save user query.")

        llm_db_data = LLMResponseCreate(
            query_id=query_id,
            explanation=request.explanation,
            examples=request.examples,
            usage_contexts=request.usage_contexts
        )
        crud.save_llm_response(llm_db_data)

        saved_query = crud.get_user_query(query_id)
        if not saved_query:
             raise HTTPException(status_code=500, detail="Failed to retrieve the saved query details.")

        return saved_query

    except MySQLError as e:
        print(f"Service Error: Database operation failed during save - {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {e.msg}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in save_explanation: {e}")
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred while saving the explanation.")