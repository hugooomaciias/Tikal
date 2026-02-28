package com.tikal.api.exception;

import com.tikal.api.model.entity.enumerated.SubscriptionPlan;
import java.util.Arrays;

public class InvalidUserPlanException extends RuntimeException {
    public InvalidUserPlanException(String planReceived) {
        super("The plan '" + planReceived + "' is not valid. The permitted values are: "
                + Arrays.toString(SubscriptionPlan.values()));
    }
}
