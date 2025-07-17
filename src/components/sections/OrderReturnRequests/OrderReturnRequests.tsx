import { OrdersPagination } from "@/components/organisms/OrdersPagination/OrdersPagination"
import { SingleOrderReturn } from "@/components/organisms/SingleOrderReturn/SingleOrderReturn"
import { Heading } from "@medusajs/ui"
import { isEmpty } from "lodash"

const LIMIT = 10

export const OrderReturnRequests = ({
  returns = [],
  user,
  page,
  currentReturn,
}: {
  returns: any[]
  user: any
  page: string
  currentReturn: string
}) => {
  // Add diagnostic logging for returns data
  console.log(`OrderReturnRequests component received ${returns.length} returns`)
  console.log('Returns statuses:', returns.map(r => ({ id: r.id, status: r.status })))
  
  const pages = Math.ceil(returns.length / LIMIT)
  const currentPage = +page || 1
  const offset = (+currentPage - 1) * LIMIT

  // Log pagination details
  console.log(`Pagination: page ${currentPage}/${pages}, offset ${offset}, showing ${Math.min(LIMIT, returns.length - offset)} items`)

  const processedReturns = returns.slice(offset, offset + LIMIT)
  
  // Verify we're returning the expected number of items
  console.log(`After slicing, processedReturns contains ${processedReturns.length} items`)

  if (isEmpty(processedReturns)) {
    return (
      <div className="mt-8">
        <Heading level="h2" className="uppercase text-center heading-lg">
          Brak zwrotów  
        </Heading>
        <p className="text-center text-secondary w-96 mt-8 mx-auto">
          {
            "Nie masz jeszcze żadnch zwrotów. Pojawią się tutaj jeżli złożysz w prośbę zwrotu w szczegółach zamówienia."
          }
        </p>
      </div>
    )
  }

  return (
    <div>
      {processedReturns.map((item) => (
        <SingleOrderReturn
          key={item.id}
          item={item}
          user={user}
          defaultOpen={currentReturn === item.id}
        />
      ))}
      <div className="mt-8 flex justify-center">
        <OrdersPagination pages={pages} />
      </div>
    </div>
  )
}
