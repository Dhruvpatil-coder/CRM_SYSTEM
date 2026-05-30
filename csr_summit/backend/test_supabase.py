from supabase_client import supabase

response = (
    supabase
    .table("attendees")
    .select("*")
    .limit(5)
    .execute()
)

print(response.data)