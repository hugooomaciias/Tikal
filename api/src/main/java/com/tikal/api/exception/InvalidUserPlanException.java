package com.tikal.api.exception;

import com.tikal.api.model.entity.enumerated.SubscriptionPlan;
import java.util.Arrays;

public class InvalidUserPlanException extends RuntimeException {
    public InvalidUserPlanException(String planReceived) {
        super("El plan '" + planReceived + "' no es valido. Los valores permitidos son: "
                + Arrays.toString(SubscriptionPlan.values()));
    }
}
