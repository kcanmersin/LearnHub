# llm.py
import os
import groq
from typing import List, Tuple
from schemas import LLMResponse

groq_client = None
try:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print("Warning: GROQ_API_KEY environment variable not set. LLM functionality will be disabled.")
    else:
        # --- Değişiklik Burada ---
        from groq import AsyncGroq
        groq_client = AsyncGroq(api_key=groq_api_key)
        print("Async Groq client initialized.")
except Exception as e:
    print(f"Failed to initialize Groq client: {e}")
    groq_client = None

def parse_llm_output(content: str) -> Tuple[str, List[str], List[str]]:
    explanation = "Explanation not found in LLM response."
    examples = ["Example not available"] * 3
    contexts = ["Context not available"] * 3
    try:
        expl_parts = content.split("EXPLANATION:", 1)
        if len(expl_parts) > 1:
            main_parts = expl_parts[1].split("EXAMPLE 1:", 1)
            explanation = main_parts[0].strip()
            content_after_expl = "EXAMPLE 1:" + main_parts[1] if len(main_parts) > 1 else ""
        else:
            content_after_expl = content
        current_content = content_after_expl
        for i in range(1, 4):
            marker = f"EXAMPLE {i}:"
            next_marker = f"EXAMPLE {i+1}:" if i < 3 else None
            start_index = current_content.find(marker)
            if start_index == -1: continue
            start_index += len(marker)
            end_index = len(current_content)
            if next_marker:
                next_marker_index = current_content.find(next_marker, start_index)
                if next_marker_index != -1:
                    end_index = next_marker_index
            example_content = current_content[start_index:end_index].strip()
            context_marker = "Context:"
            context_index = example_content.rfind(context_marker)
            if context_index != -1:
                examples[i-1] = example_content[:context_index].strip()
                contexts[i-1] = example_content[context_index + len(context_marker):].strip()
            else:
                examples[i-1] = example_content
                contexts[i-1] = "Context not specified."
    except Exception as e:
        print(f"Error parsing LLM output: {e}\nContent received:\n{content}")
    return explanation, examples, contexts

async def get_llm_explanation(text: str, input_type: str) -> LLMResponse:
    if not groq_client:
        raise ConnectionError("LLM service is not available (client not initialized).")

    if input_type == "word":
        prompt = f"""
        Analyze the English word "{text}" for a Turkish learner. Provide:
        1. A clear explanation of the word's meaning(s) in English.
        2. Three distinct example sentences showing the word in context.
        3. For each example, briefly explain the context or nuance demonstrated.

        Format the response STRICTLY as follows:
        EXPLANATION: [Your explanation here]

        EXAMPLE 1: [Sentence 1 here]
        Context: [Explanation for sentence 1]

        EXAMPLE 2: [Sentence 2 here]
        Context: [Explanation for sentence 2]

        EXAMPLE 3: [Sentence 3 here]
        Context: [Explanation for sentence 3]
        """
    elif input_type == "sentence":
        prompt = f"""
        Analyze the English sentence "{text}" for a Turkish learner. Provide:
        1. An explanation of the sentence's meaning and key grammatical structure in English.
        2. Three distinct example sentences using a similar structure or conveying a similar idea.
        3. For each example, briefly explain the context or purpose.

        Format the response STRICTLY as follows:
        EXPLANATION: [Your explanation here]

        EXAMPLE 1: [Sentence 1 here]
        Context: [Explanation for sentence 1]

        EXAMPLE 2: [Sentence 2 here]
        Context: [Explanation for sentence 2]

        EXAMPLE 3: [Sentence 3 here]
        Context: [Explanation for sentence 3]
        """
    else:
        raise ValueError("Invalid input_type provided to LLM function.")

    try:
        # async client ile await kullanımı artık doğru
        chat_completion = await groq_client.chat.completions.create(
            messages=[
                 {
                    "role": "system",
                    "content": "You are an expert English language teacher explaining concepts to Turkish learners. Follow the requested format precisely."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-70b-8192",
            temperature=0.6,
            max_tokens=1024,
        )
        content = chat_completion.choices[0].message.content
        explanation, examples, usage_contexts = parse_llm_output(content)
        return LLMResponse(
            explanation=explanation,
            examples=examples,
            usage_contexts=usage_contexts
        )
    except groq.APIError as e:
        print(f"Groq API Error: {e}")
        raise RuntimeError(f"LLM service API error: {e.message}") from e
    except Exception as e:
        print(f"Unexpected error during LLM explanation: {e}")
        raise RuntimeError(f"Failed to get explanation from LLM: {str(e)}") from e