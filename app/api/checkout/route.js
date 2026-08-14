export async function POST(request){
    const {total, isMember} = await request.json()

    return Response.json({
        message: "Checkout confirmed at R$ " + total
    })
}